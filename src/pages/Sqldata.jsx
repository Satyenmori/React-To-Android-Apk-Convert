import React, { useState, useEffect } from 'react';
import { initDB, saveFormData } from './databse';


const SqlForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const setupDB = async () => {
      await initDB();
    };
    setupDB();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveFormData(name, email, phone);
    alert('Data saved successfully!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name:</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      
      <label>Email:</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      
      <label>Phone:</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default SqlForm;
