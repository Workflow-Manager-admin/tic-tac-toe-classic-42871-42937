import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders Tic Tac Toe main headline', () => {
  render(<App />);
  const header = screen.getByRole('heading', { name: /tic tac toe/i });
  expect(header).toBeInTheDocument();
});
