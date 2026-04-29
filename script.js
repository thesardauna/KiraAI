body {
  font-family: Arial, sans-serif;
  background: #0b0f1a;
  color: white;
  text-align: center;
  margin: 0;
  padding: 0;
}

header {
  padding: 20px;
}

.container {
  width: 90%;
  max-width: 1100px;
  margin: auto;
}

.topbar {
  margin-bottom: 15px;
}

select {
  padding: 10px;
  border-radius: 8px;
  border: none;
  margin-left: 10px;
}

.controls button {
  margin: 10px;
  padding: 12px 16px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  background: #1f6feb;
  color: white;
  font-weight: bold;
}

.controls button:hover {
  opacity: 0.9;
}

.city-info {
  margin: 20px 0;
  padding: 15px;
  background: #121a2a;
  border-radius: 12px;
}

#network {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.tower {
  height: 90px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  padding: 8px;
}

.low { background: #1f8f4a; }
.medium { background: #d98b1a; }
.high { background: #c0392b; }
.offline { background: #6b6b6b; }

.stats {
  margin-top: 20px;
  font-size: 18px;
  padding-bottom: 30px;
}
