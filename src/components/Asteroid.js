import React, { useState, useEffect, useRef } from 'react'
import './Asteroid.css'
import Chart from 'chart.js/auto';


function Asteroid() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [resu, setRes] = useState(null);
  const [fastest, setFastest] = useState(null);
  const [closest, setClosest] = useState(null);
  const [averageSize, setAverageSize] = useState(null);

  const canvasRef = useRef();

  useEffect(() => {
    if (resu) {
      const labels = resu.map((asteroid) => asteroid.date);
      const data = resu.map((asteroid) => asteroid.count);

      new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Asteroids passing near earth",
              data: data,
              fill: false,
              borderColor: "red",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }, [resu]);

  const getAsteroid = async () => {
    // if startDate and endDate is less than equal to today's data
    const today = new Date().toISOString().slice(0, 10);

    if (start > today || end < start) {
      alert('Please enter a valid date range.');
      return;
    }

    const data = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=T0bngrRP8PNZdDbfUT1RpcTiMbzsPXW66uC2Gkdb`
    );
    const res = await data.json();
    // console.log(res)
    const { near_earth_objects } = res;

    const dates = Object.keys(near_earth_objects).sort();
    const asteroidsByDate = dates.map((date) => {
      return {
        date,
        count: near_earth_objects[date].length,
      };
    });
    // console.log(asteroidsByDate)
    setRes(asteroidsByDate);
    // console.log(resu)


    // calculate fastest asteroid
    const allAsteroids = Object.values(near_earth_objects).flat();
    console.log(allAsteroids)
    const fastestAsteroid = allAsteroids.reduce((prev, current) => {
      return prev.close_approach_data[0].relative_velocity.kilometers_per_hour >
        current.close_approach_data[0].relative_velocity.kilometers_per_hour
        ? prev
        : current;
    });
    console.log(fastestAsteroid)
    setFastest(fastestAsteroid);
    // console.log(fastest)

    // calculate closest asteroid
    const closestAsteroid = allAsteroids.reduce((prev, current) => {
      return prev.close_approach_data[0].miss_distance.kilometers <
        current.close_approach_data[0].miss_distance.kilometers
        ? prev
        : current;
    });
    setClosest(closestAsteroid);

    // calculate average size
    const totalSize = allAsteroids.reduce(
      (prev, current) => prev + current.estimated_diameter.kilometers.estimated_diameter_max,
      0
    );
    const averageSize = totalSize / allAsteroids.length;
    console.log(averageSize)
    setAverageSize(averageSize);
  };

  return (
    <div>

      <div >
        <h2>Select a range</h2>
        <div className=''>
          <label htmlFor="start-date" className='label'>Start Date</label>
          <input type="date" name="start-date" className='Date' placeholder="Start Date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>

        <div>
          <label htmlFor="End-date" className='label'>End Date</label>
          <input type="date" name="end-date" className='Date' placeholder="End Date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>

        <button className='btn' onClick={getAsteroid}>Submit</button>
      </div>
      <div>
        <div><canvas ref={canvasRef} width="100%" height="50"></canvas></div>
        <div>
          {fastest && (
            
             <h2>Fastest Asteroid: {fastest.name} ({fastest.close_approach_data[0].relative_velocity.kilometers_per_hour} km/h)</h2> 
           
          )}
          {closest && (
           
             <h2>Closest Asteroid: {closest.name} ({closest.close_approach_data[0].relative_velocity.kilometers_per_hour} km/h)</h2> 
            
          )}
          {averageSize && (
           
             <h2>AverageSize of the Asteroid:({averageSize} km/h)</h2>
          )}
        </div>
      </div>
    </div>
  )
}

export default Asteroid

