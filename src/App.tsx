import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

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

type Homeworld = {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
};

type Film = {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
  created: string;
  edited: string;
  url: string;
};

type ModalProps = {
  person: Person;
  films: Film[];
  homeworld: Homeworld | null;
  loading: boolean;
  onClose: () => void;
};

function Modal({ person, films, homeworld, onClose, loading }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        data-testid="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
        <h2>{person.name}</h2>
        <p>
          <strong>Height:</strong> {person.height}
        </p>
        <p>
          <strong>Mass:</strong> {person.mass}
        </p>
        <p>
          <strong>Hair Color:</strong> {person.hair_color}
        </p>
        <p>
          <strong>Skin Color:</strong> {person.skin_color}
        </p>

        {loading ? (
          <p>Loading additional details...</p>
        ) : (
          <>
            <h3>Films</h3>
            <ul>
              {films.map((film) => (
                <li key={film.episode_id}>{film.title}</li>
              ))}
            </ul>
            <h3>Homeworld</h3>
            {homeworld ? (
              <p>
                {homeworld.name} (Population: {homeworld.population})
              </p>
            ) : (
              <p>No homeworld data available</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPersonFilms, setSelectedPersonFilms] = useState<Film[]>([]);
  const [homeworld, setHomeworld] = useState<Homeworld | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchCharacter, setSearchCharacter] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState<Person[]>([]);

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

        // Add all characters to the filtered users state so that all characters are displayed when app starts
        setFilteredCharacters(allCharacters);
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchCharacter(searchTerm);
    const filteredPeople = people.filter((person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCharacters(filteredPeople);
  };

  const handleCardClick = async (person: Person) => {
    setSelectedPerson(person);
    setModalLoading(true);
    try {
      const filmsData = await Promise.all(
        person.films.map((url) =>
          fetch(url).then((res) => {
            if (!res.ok) {
              throw new Error('Film fetch failed');
            }
            return res.json();
          })
        )
      );
      setSelectedPersonFilms(filmsData);
      const homeWorldResponse = await fetch(person.homeworld);
      if (!homeWorldResponse.ok) {
        console.log('Homeworld fetch failed');
        throw new Error('Homeworld fetch failed');
      }
      const homeWorldData = await homeWorldResponse.json();
      const homeworldRaw = homeWorldData as Homeworld;
      setHomeworld(homeworldRaw);
    } catch (err) {
      console.error('Error fetching additional details:', err);
    }
    setModalLoading(false);
  };

  return (
    <div>
      <div className="search-wrapper">
        <input
          className="search-input"
          type="text"
          value={searchCharacter}
          onChange={handleInputChange}
          placeholder="Search character"
        />
      </div>

      <div className="character-container">
        {filteredCharacters.map((person) => (
          <div
            className="character-card"
            key={person.name}
            onClick={() => handleCardClick(person)}
          >
            <p>{person.name}</p>
            <img src={person.photo} alt={person.name} />
          </div>
        ))}

        {selectedPerson && (
          <Modal
            person={selectedPerson}
            films={selectedPersonFilms}
            homeworld={homeworld}
            loading={modalLoading}
            onClose={() => {
              setSelectedPerson(null);
              setHomeworld(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
