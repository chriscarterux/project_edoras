import { Button, Card, Input, makeStyles, shorthands } from '@fluentui/react-components';
import { useState } from 'react';
import type { ChangeEvent } from 'react';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f5f5f5',
    ...shorthands.padding('2rem'),
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    ...shorthands.padding('2rem'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
});

function App() {
  const styles = useStyles();
  const [name, setName] = useState('');

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2>Welcome to Fluent UI + Vite</h2>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => setName(ev.target.value)}
        />
        <Button appearance="primary">Hello {name || 'World'}!</Button>
      </Card>
    </div>
  );
}

export default App;
