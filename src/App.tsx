import { useEffect, useState } from 'react';

type Person = {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
  photo: string;
};

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function loadAllCharacters() {
      try {
        let url = 'https://swapi.info/api/people';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response error');

        const results: Person[] = await response.json();

        const allCharacters = results.map((person: Person) => ({
          ...person,
          photo: `https://picsum.photos/seed/${encodeURIComponent(
            person.name
          )}/200`,
        }));

        setPeople(allCharacters);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
    return <p>A network error was encountered</p>;
  }

  return (
    <div className="character-container">
      {people.map((person) => (
        <div className="character-card" key={person.name}>
          <p>{person.name}</p>
          <img src={person.photo} alt={person.name} />
        </div>
      ))}
    </div>
  );
}

export default App;
