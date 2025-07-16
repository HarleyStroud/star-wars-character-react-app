import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../src/App';

beforeEach(() => {
  vi.stubGlobal('fetch', (url: string) => {
    if (url.endsWith('/people')) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              hair_color: 'blond',
              skin_color: 'fair',
              films: ['https://swapi.dev/api/films/1/'],
              homeworld: 'https://swapi.dev/api/planets/1/',
            },
          ])
        )
      );
    }
    if (url.endsWith('/films/1/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ title: 'A New Hope', episode_id: 4 }))
      );
    }
    if (url.endsWith('/planets/1/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ name: 'Tatooine', population: '200000' }))
      );
    }
    return Promise.reject(new Error(`Unhandled URL: ${url}`));
  });
});

afterEach(() => vi.resetAllMocks());

test('opens modal with correct person info', async () => {
  render(<App />);

  const card = await screen.findByText('Luke Skywalker');
  await userEvent.click(card);

  const modal = await screen.findByTestId('modal-content');

  expect(modal).toHaveTextContent('Luke Skywalker');
  expect(modal).toHaveTextContent('Height: 172');
  expect(modal).toHaveTextContent('A New Hope');
  expect(modal).toHaveTextContent('Tatooine');

  await userEvent.click(screen.getByRole('button', { name: /close/i }));
  await waitFor(() =>
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument()
  );
});
