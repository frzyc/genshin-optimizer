import { render, waitFor } from '@testing-library/react';
import App from './App';

test.skip('Check for Header', async () => {
  const { container, getByText } = render(<App />);
  await waitFor(() => {
    expect(container.querySelector("#mainContainer")).toBeInTheDocument();
  })
  expect(getByText(/^Genshin Optimizer$/i)).toBeInTheDocument();
});
