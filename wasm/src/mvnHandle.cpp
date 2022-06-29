// #define EMITWASM

#include <vector>
#include <math.h>
#ifdef EMITWASM
#include <emscripten/bind.h>
#else
#include <iostream>
#endif

/* Declare `mvndst_` from Fortran file. */
extern "C" void mvndst_(int *, double *, double *, int *, double *, int *, double *, double *, double *, double *, int *);

/* Standard Gaussian density function. */
inline double phi1(double mu, double sig2) { return exp(-mu * mu / sig2 / 2) / sqrt(2 * M_PI * sig2); }

/* MIN and MAX macros, except they're inline functions for compiler fun. */
inline int32_t MIN(int32_t a, int32_t b) { return ((a) < (b) ? a : b); }
inline int32_t MAX(int32_t a, int32_t b) { return ((a) > (b) ? a : b); }
#define LARGEFINITE 1048576
#define DIVZERO(value) ((value) < 0 ? -LARGEFINITE : ((value) > 0 ? LARGEFINITE : 0))

/**
 * Triangular number generators and inverters.
 * Consider a lower triangular indexing of (n=4):
 *   [[-, -, -, -],
 *    [0, -, -, -],
 *    [1, 2, -, -],
 *    [3, 4, 5, -]]
 * The index `k` is located with coordinates (i, j) in the above matrix.
 * The following is an efficient method to convert between (i,j) and k.
 */
inline int ij2k(int i, int j)
{
  int a = MIN(i, j);
  int b = MAX(i, j);
  return a + (b * (b - 1)) / 2;
}
inline int k2i(int k) { return floor((1 + sqrt(1 + 8 * k)) / 2); }
inline int ki2j(int k, int i) { return k - ((i * (i - 1)) / 2); }

/**
 * @brief Multivariate Normal distribution handler
 * Provides an interface to compute various statistics related to a multivariate normal distribution. Intended
 *   for use with GenshinOptimizer. Provided calculations:
 *   - Upper cumulative distribution function        Probability of a query
 *   - Skip-first upper CDF                          Probability of a query's constraints
 *   - Mean of truncated distribution                Conditional expectation (mean) of truncated distribution
 */
class MVNHandle
{
public:
  MVNHandle(int n) : MVNHandle(n, 1024 * n) {}
  MVNHandle(int n, int imaxpts) : dim(n), maxpts(imaxpts), infin(dim, 1) {}

  void compute()
  {
    for (int i = 0; i < dim; ++i)
    {
      stds.push_back(sqrt(cov[i + dim * i]));
      if (stds.back() == 0)
        lower.push_back(DIVZERO(x[i] - mu[i]));
      else
        lower.push_back((x[i] - mu[i]) / stds[i]);
      for (int j = 0; j < i; ++j)
      {
        if (stds[i] == 0 || stds[j] == 0)
        {
          correl.push_back(0);
          continue;
        }
        correl.push_back(cov[i + dim * j] / stds[i] / stds[j]);
      }
    }
    dim = lower.size();

    double abseps = 1e-4;
    double releps = 1e-3;
    // Compute main probability.
    mvndst_(&dim, lower.data(), nullptr, infin.data(), correl.data(), &maxpts, &abseps, &releps, &errP, &prob, &inform);

    // Compute `constraint probability` by ignoring first axis.
    infin[0] = -1;
    mvndst_(&dim, lower.data(), nullptr, infin.data(), correl.data(), &maxpts, &abseps, &releps, &errCP, &constrainProb, &inform);
    infin[0] = 1;

    // Compute first moments according to recurrence relation given by Kan and Robotti
    //   "On Moments of Folded and Truncated Multivariate Normal Distributions" (2017)
    //   DOI: 10.1080/10618600.2017.1322092
    for (int i = 0; i < dim; i++)
      d0j.push_back(computeDkj(lower, correl, i));

    for (int j = 0; j < dim; j++)
    {
      if (prob < 1e-8)
        moments.push_back(0);
      else if (stds[j] < 1e-8)
        moments.push_back(mu[j] - x[j]);
      else
      {
        double c2 = 0;
        for (int i = 0; i < dim; i++)
          c2 += i == j ? d0j[i] : d0j[i] * correl[ij2k(i, j)];
        moments.push_back(stds[j] * (-lower[j] + c2 / prob));
      }
    }
  }

  void narrow() { maxpts *= 16; }

  double getConstrainProb() const { return constrainProb; }
  double getMoment(int j) const { return moments[j]; }
  double getEUp() const { return getMoment(0); }
  double getPEUp() const
  {
    int j = 0;
    if (stds[j] < 1e-8)
      return prob * (mu[j] - x[j]);

    double c2 = 0;
    for (int i = 0; i < dim; i++)
      c2 += (i == j ? d0j[i] : d0j[i] * correl[ij2k(i, j)]);
    return stds[j] * (c2 - lower[j] * prob);
  }
  double getValue() const { return prob; }
  double getErrP() const { return errP; }
  double getErrCP() const { return errCP; }
  // double getInform() const { return inform; }

  void pushX(double xi) { x.push_back(xi); }
  void pushMu(double mui) { mu.push_back(mui); }
  void pushCov(double covi) { cov.push_back(covi); }

private:
  double prob;
  double constrainProb;
  std::vector<double> moments;
  double errP;
  double errCP;
  int inform;

  int dim;
  int maxpts;
  std::vector<double> x;
  std::vector<double> mu;
  std::vector<double> cov;
  std::vector<int> infin;

  std::vector<double> stds;
  std::vector<double> lower;
  std::vector<double> correl;

  // Store Kan & Robotti's recurrence parameters here.
  std::vector<double> d0j;

  // mmu is -mu
  // Calculates `d_0` vector component-wise using formula given by Kan & Robotti.
  // DOI: 10.1080/10618600.2017.1322092
  double computeDkj(const std::vector<double> &mmu, const std::vector<double> &correl, int j)
  {
    if (dim == 1)
      return phi1(mmu[j], 1);
    std::vector<double> mu_tilde;
    std::vector<double> correl_tilde;
    std::vector<double> std_tilde;

    for (int i = 0; i < dim; i++)
    {
      std_tilde.push_back(0);
      if (i == j)
        continue;

      if (correl[ij2k(i, j)] >= 1) // Degenerate case.
      {
        std_tilde[i] = 0;
        mu_tilde.push_back(DIVZERO(mmu[i] - mmu[j]));
      }
      else
      {
        std_tilde[i] = sqrt(1 - correl[ij2k(i, j)] * correl[ij2k(i, j)]);
        mu_tilde.push_back((mmu[i] - correl[ij2k(i, j)] * mmu[j]) / std_tilde[i]);
      }

      for (int k = 0; k < i; k++)
      {
        if (k == j)
          continue;
        if (std_tilde[i] == 0 || std_tilde[j] == 0)
        {
          correl_tilde.push_back(0);
          continue;
        }
        double c_ik = correl[ij2k(i, k)] - correl[ij2k(i, j)] * correl[ij2k(j, k)];
        correl_tilde.push_back(c_ik / std_tilde[i] / std_tilde[k]);
      }
    }

    int dimDK = dim - 1;
    double abseps = 1e-2;
    double releps = 5e-2;
    double res, err;
    mvndst_(&dimDK, mu_tilde.data(), nullptr, infin.data(), correl_tilde.data(), &maxpts, &abseps, &releps, &err, &res, &inform);
    // std::cout << "RESULT " << j << ": " << res << " ± " << err << std::endl;

    return phi1(mmu[j], 1) * res;
  }
};

#ifdef EMITWASM
// Binding code
EMSCRIPTEN_BINDINGS(mvn_handle)
{
  emscripten::class_<MVNHandle>("MVNHandle")
      .constructor<int>()
      .constructor<int, int>()
      .property("p", &MVNHandle::getValue)
      .property("cp", &MVNHandle::getConstrainProb)
      .property("Eup", &MVNHandle::getEUp)
      .property("pEup", &MVNHandle::getPEUp)
      .property("errP", &MVNHandle::getErrP)
      .property("errCP", &MVNHandle::getErrCP)

      .function("pushX", &MVNHandle::pushX)
      .function("pushMu", &MVNHandle::pushMu)
      .function("pushCov", &MVNHandle::pushCov)

      .function("narrow", &MVNHandle::narrow)
      .function("compute", &MVNHandle::compute);
}
#else
int main(int argc, char **argv)
{
  std::cout << "hello world!?\n";
  // MVNHandle mvn(4);
  // double a[] = {0.22155036, 0.87036023, 0.71780895, 0.24850319};
  // for (double d : a)
  //   mvn.pushMu(d);

  // double b[] = {0.25596496, 0.28235019, -0.13181232, 0.08882034,
  //               0.28235019, 0.3995947, -0.00461601, 0.23116059,
  //               -0.13181232, -0.00461601, 0.3380654, 0.25671531,
  //               0.08882034, 0.23116059, 0.25671531, 0.41857041};
  // for (double d : b)
  //   mvn.pushCov(d);

  // for (int i = 0; i < 4; i++)
  //   mvn.pushX(0);

  // mvn.compute();

  // std::cout << "P:  " << mvn.getValue() << " ± " << mvn.getErrP() << std::endl;          // should be near 0.45531
  // std::cout << "CP: " << mvn.getConstrainProb() << " ± " << mvn.getErrCP() << std::endl; // should be near 0.61364

  // std::cout << "Moments:\n  [";
  // for (int i = 0; i < 4; i++)
  //   std::cout << mvn.getMoment(i) << ", ";
  // std::cout << "]\n";

  // MVNHandle mvn(2);
  // double x[] = {0, 0};
  // double mu[] = {1, 1};
  // double cov[] = {1, 1, 1, 1};
  // double mu[] = {31954.805004473237, 2556.4394303978797};
  // double x[] = {31777.245955648243, 3000};
  // double cov[] = {26088.171042120885, 0, 0, 0};

  // for (double d : mu)
  //   mvn.pushMu(d);
  // for (double d : x)
  //   mvn.pushX(d);
  // for (double d : cov)
  //   mvn.pushCov(d);

  // mvn.compute();

  // double eup = mvn.getEUp();
  // std::cout << mvn.getValue() << ", " << eup << "\n";
  // std::cout << mvn.getPEUp() << " vs " << mvn.getValue() * eup << "\n";

  // MVNHandle mvn2(2);
  // double mu2[] = {3646.497, 1.8845};
  // double x2[] = {3334.86, 1.8};
  // double cov2[] = {0, 0, 0, 0};
  // for (double d : mu2)
  //   mvn2.pushMu(d);
  // for (double d : x2)
  //   mvn2.pushX(d);
  // for (double d : cov2)
  //   mvn2.pushCov(d);

  // mvn2.compute();
  // double eup2 = mvn2.getEUp();
  // std::cout << mvn2.getValue() << ", " << eup2 << "\n";
  // std::cout << mvn2.getPEUp() << " vs " << mvn2.getValue() * eup2 << "\n";

  // MVNHandle mvn3(3);
  // double mu3[] = {17138.664897515624, 1.90998, 65.27};
  // double x3[] = {16320.574836804108, 1.5, 60};
  // double cov3[] = {204.08784901630685, 0.09257283843187661, 0,
  //                  0.09257283843187661, 0.0000419904, 0,
  //                  0, 0, 0};
  // for (double d : mu3)
  //   mvn3.pushMu(d);
  // for (double d : x3)
  //   mvn3.pushX(d);
  // for (double d : cov3)
  //   mvn3.pushCov(d);

  // mvn3.compute();

  // std::cout << "eup failing?\n";
  // double eup3 = mvn3.getEUp();
  // std::cout << mvn3.getValue() << ", " << eup3 << "\n";
  // std::cout << mvn3.getPEUp() << " vs " << mvn3.getValue() * eup3 << "\n";

  MVNHandle ng(1); // negative value debug
  ng.pushX(277279.15757776);
  ng.pushMu(274849.23454438325);
  ng.pushCov(530831.8330317889);

  ng.compute();
  std::cout << "p: " << ng.getValue() << ", Eup: " << ng.getEUp() << std::endl;
  std::cout << "PEup: " << ng.getPEUp() << " vs p * Eup: " << ng.getValue() * ng.getEUp() << std::endl;
};
#endif
