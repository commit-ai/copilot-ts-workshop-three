import React, { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';

const ENABLE_BATTLE_NARRATION = false; // Set to true to enable battle narration feature

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'
  const [narration, setNarration] = useState(null);
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [narrationError, setNarrationError] = useState(null);
  const [narrationKey, setNarrationKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef(null);

  // Fetch heroes: full list on mount, or search results when query changes
  const fetchHeroes = useCallback((query) => {
    setSearchLoading(true);
    const url = query
      ? `/api/superheroes/search?q=${encodeURIComponent(query)}`
      : '/api/superheroes';
    fetch(url)
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error))
      .finally(() => setSearchLoading(false));
  }, []);

  // Initial load (full list)
  useEffect(() => {
    fetchHeroes('');
  }, [fetchHeroes]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchHeroes(value.trim());
    }, 300);
  };

  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove if already selected
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, hero];
      } else {
        // Replace first selection if 2 already selected
        return [prev[1], hero];
      }
    });
  };

  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
      setNarration(null);
      setNarrationError(null);
    }
  };

  const handleGetNarration = async () => {
    if (selectedHeroes.length !== 2) return;
    
    setNarrationLoading(true);
    setNarrationError(null);
    
    try {
      const response = await fetch('/api/battle-narration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hero1: selectedHeroes[0],
          hero2: selectedHeroes[1],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch narration');
      }
      
      const data = await response.json();
      setNarration(data.narration);
    } catch (error) {
      console.error('Error fetching narration:', error);
      setNarrationError('Failed to generate battle narration. Please try again.');
    } finally {
      setNarrationLoading(false);
    }
  };

  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
    });

    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    
    const [hero1, hero2] = selectedHeroes;
    const result = calculateWinner(hero1, hero2);
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    return (
      <div className="comparison-view">
        <button className="back-button" onClick={handleBackToTable}>
          ← Back to Heroes Table
        </button>
        <h1>Superhero Comparison</h1>
        
        <div className="comparison-container">
          <div className="hero-card">
            <img src={hero1.image} alt={hero1.name} className="hero-image" />
            <h2>{hero1.name}</h2>
          </div>
          
          <div className="vs-section">
            <h2>VS</h2>
          </div>
          
          <div className="hero-card">
            <img src={hero2.image} alt={hero2.name} className="hero-image" />
            <h2>{hero2.name}</h2>
          </div>
        </div>

        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            const winner = stat1 > stat2 ? 'hero1' : stat1 < stat2 ? 'hero2' : 'tie';
            
            return (
              <div key={stat} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>
                  {stat1}
                </div>
                <div className="stat-name">
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
                <div className={`stat-value ${winner === 'hero2' ? 'winner' : ''}`}>
                  {stat2}
                </div>
              </div>
            );
          })}
        </div>

        <div className="final-result">
          <h2>Final Result</h2>
          {result.winner ? (
            <div className="winner-announcement">
              <h3>🏆 {result.winner.name} Wins!</h3>
              <p>Score: {result.score}</p>
            </div>
          ) : (
            <div className="tie-announcement">
              <h3>🤝 It's a Tie!</h3>
              <p>Score: {result.score}</p>
            </div>
          )}
        </div>

        {ENABLE_BATTLE_NARRATION && (
          <div className="battle-narration-section">
            <h2>Battle Narration</h2>
            {!narration && !narrationLoading && !narrationError && (
              <button 
                className="narration-button" 
                onClick={handleGetNarration}
              >
                Generate Epic Battle Story
              </button>
            )}
            {narrationLoading && (
              <div className="narration-loading">
                <p>Generating epic battle narration...</p>
              </div>
            )}
            {narrationError && (
              <div className="narration-error">
                <p>{narrationError}</p>
                <button 
                  className="narration-button" 
                  onClick={handleGetNarration}
                >
                  Try Again
                </button>
              </div>
            )}
            {narration && (
              <div className="narration-content">
                <div className="narration-wrapper">
                  <p 
                    key={narrationKey}
                    onAnimationEnd={() => setNarrationKey(prev => prev + 1)}
                  >
                    {narration}
                  </p>
                </div>
                <button 
                  className="narration-button" 
                  onClick={handleGetNarration}
                >
                  Re-generate Battle
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search superheroes..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchLoading && <span className="search-spinner">Searching…</span>}
      </div>

      {superheroes.length === 0 && searchQuery.trim() !== '' && !searchLoading ? (
        <p className="no-results">No superheroes matching the search query</p>
      ) : (
        <>
          <div className="selection-info">
            <p>Select 2 superheroes to compare ({selectedHeroes.length}/2 selected)</p>
        {selectedHeroes.length > 0 && (
          <div className="selected-heroes">
            Selected: {selectedHeroes.map(h => h.name).join(', ')}
          </div>
        )}
        <button 
          className="compare-button" 
          onClick={handleCompare}
          disabled={selectedHeroes.length !== 2}
        >
          Compare Heroes
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Intelligence</th>
            <th>Strength</th>
            <th>Speed</th>
            <th>Durability</th>
            <th>Power</th>
            <th>Combat</th>
          </tr>
        </thead>
        <tbody>
          {superheroes.map((hero) => (
            <tr 
              key={hero.id} 
              className={isHeroSelected(hero.id) ? 'selected-row' : ''}
            >
              <td>
                <input
                  type="checkbox"
                  checked={isHeroSelected(hero.id)}
                  onChange={() => handleHeroSelection(hero)}
                />
              </td>
              <td>{hero.id}</td>
              <td>{hero.name}</td>
              <td><img src={hero.image} alt={hero.name} width="50" /></td>
              <td>{hero.powerstats.intelligence}</td>
              <td>{hero.powerstats.strength}</td>
              <td>{hero.powerstats.speed}</td>
              <td>{hero.powerstats.durability}</td>
              <td>{hero.powerstats.power}</td>
              <td>{hero.powerstats.combat}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
