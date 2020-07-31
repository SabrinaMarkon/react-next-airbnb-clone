import React from 'react';
import houses from './houses.json';
import House from '../components/House';

const Index = () => (
  <div>
    <h1>Welcome to NextBNB!</h1>
    <div className="houses">
      {houses.map((house, index) => {
        return <House key={index} {...house} />
      })}
    </div>
  </div>
);

export default Index;