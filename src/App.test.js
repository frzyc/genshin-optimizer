import { render } from '@testing-library/react';
import App from './App';

test('Check for Header', () => {
  const { container, getByText } = render(<App />);
  expect(getByText(/^Genshin Optimizer$/i)).toBeInTheDocument();
});
