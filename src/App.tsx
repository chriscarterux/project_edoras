import { Button, Card, Input, Label, makeStyles, shorthands, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, MenuButton, Tab, TabList, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, SearchBox } from '@fluentui/react-components';
import { useState, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

const useStyles = makeStyles({
  // Login styles
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    background: 'var(--colorNeutralBackground1)',
    margin: 0,
    padding: 0,
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    ...shorthands.padding('2rem'),
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    background: 'var(--colorNeutralBackground2)',
    borderRadius: '8px',
    border: '1px solid var(--colorNeutralStroke1)',
  },
  logo: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1rem auto',
    display: 'block',
  },
  headline: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 1rem 0',
    color: 'var(--colorNeutralForeground1)',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'var(--colorNeutralStroke2)',
    margin: '0',
    border: 'none',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--colorNeutralForeground1)',
    marginBottom: '0.5rem',
    display: 'block',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'space-between',
  },

  // Dashboard styles
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    background: 'var(--colorNeutralBackground1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('1rem 2rem'),
    background: 'var(--colorNeutralBackground2)',
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    minHeight: '64px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerLogo: {
    width: '32px',
    height: '32px',
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--colorNeutralForeground1)',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  tabBar: {
    display: 'flex',
    background: 'var(--colorNeutralBackground3)',
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    minHeight: '40px',
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftPanel: {
    width: '60%',
    display: 'flex',
    background: 'var(--colorNeutralBackground1)',
    height: '100%',
  },
  navigationPanel: {
    width: '200px',
    background: 'var(--colorNeutralBackground2)',
    borderRight: '1px solid var(--colorNeutralStroke1)',
    ...shorthands.padding('1rem'),
    height: '100%',
    overflow: 'auto',
  },
  workbench: {
    flex: 1,
    ...shorthands.padding('1rem'),
    overflow: 'auto',
  },
  searchContainer: {
    marginBottom: '1rem',
  },
  tableContainer: {
    border: '1px solid var(--colorNeutralStroke1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  miniApp: {
    width: '30%',
    background: 'var(--colorNeutralBackground2)',
    borderLeft: '1px solid var(--colorNeutralStroke1)',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    ...shorthands.padding('1rem'),
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    fontWeight: 'bold',
  },
  chatArea: {
    flex: 1,
    ...shorthands.padding('1rem'),
    overflow: 'auto',
  },
  chatInput: {
    ...shorthands.padding('1rem'),
    borderTop: '1px solid var(--colorNeutralStroke1)',
  },
  navSidebar: {
    width: '10%',
    background: 'var(--colorNeutralBackground3)',
    borderLeft: '1px solid var(--colorNeutralStroke1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding('1rem 0.5rem'),
    gap: '1rem',
  },
  navIcon: {
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    ...shorthands.padding('0.5rem'),
    borderRadius: '4px',
    ':hover': {
      background: 'var(--colorNeutralBackground4)',
    },
  },
});

function App() {
  const styles = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  // Check for existing login state on app load
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedLoginState === 'true' && savedEmail) {
      setIsLoggedIn(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleCancel = () => {
    setEmail('');
    setPassword('');
  };

  const handleContinue = () => {
    if (email && password) {
      setIsLoggedIn(true);
      // Save login state to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    // Clear login state from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  };

  const handleChatSend = () => {
    if (chatMessage.trim()) {
      console.log('Chat message:', chatMessage);
      setChatMessage('');
    }
  };

  // Sample queue data
  const queueData = [
    { id: 1, name: 'Queue Alpha', status: 'Active', priority: 'High', created: '2024-01-15' },
    { id: 2, name: 'Queue Beta', status: 'Pending', priority: 'Medium', created: '2024-01-14' },
    { id: 3, name: 'Queue Gamma', status: 'Active', priority: 'Low', created: '2024-01-13' },
    { id: 4, name: 'Queue Delta', status: 'Completed', priority: 'High', created: '2024-01-12' },
  ];

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <Card className={styles.loginCard}>
          <svg className={styles.logo} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="12" fill="var(--colorBrandBackground)" />
            <path d="M16 24h32v2H16v-2zm0 6h32v2H16v-2zm0 6h24v2H16v-2z" fill="var(--colorNeutralForegroundOnBrand)" />
            <circle cx="48" cy="42" r="3" fill="var(--colorNeutralForegroundOnBrand)" />
          </svg>
          <h1 className={styles.headline}>Special Desktop</h1>
          <div className={styles.divider}></div>
          <div className={styles.inputContainer}>
            <Label className={styles.label}>Email address</Label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => setEmail(ev.target.value)}
            />
          </div>
          <div className={styles.inputContainer}>
            <Label className={styles.label}>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => setPassword(ev.target.value)}
            />
          </div>
          <div className={styles.buttonContainer}>
            <Button appearance="outline" onClick={handleCancel}>
              No, cancel login
            </Button>
            <Button appearance="primary" onClick={handleContinue}>
              Yes, continue login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <svg className={styles.headerLogo} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="var(--colorBrandBackground)" />
            <path d="M8 12h16v1H8v-1zm0 3h16v1H8v-1zm0 3h12v1H8v-1z" fill="var(--colorNeutralForegroundOnBrand)" />
            <circle cx="24" cy="21" r="1.5" fill="var(--colorNeutralForegroundOnBrand)" />
          </svg>
          <h1 className={styles.headerTitle}>Special Desktop</h1>
        </div>
        <div className={styles.headerRight}>
          <Button appearance="primary">Start New Customer</Button>
          <Menu>
            <MenuTrigger>
              <MenuButton appearance="subtle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" fill="var(--colorNeutralForeground1)" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="var(--colorNeutralForeground1)" />
                </svg>
              </MenuButton>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuItem>Profile</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </header>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <TabList>
          <Tab value="queues">Queues</Tab>
          <Tab value="customers">Customers</Tab>
          <Tab value="reports">Reports</Tab>
        </TabList>
      </div>

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Left Panel - Navigation + Workbench */}
        <div className={styles.leftPanel}>
          <div className={styles.navigationPanel}>
            <h3>Navigation</h3>
            <div>Dashboard</div>
            <div>Queues</div>
            <div>Customers</div>
            <div>Reports</div>
          </div>
          <div className={styles.workbench}>
            <div className={styles.searchContainer}>
              <SearchBox placeholder="Search queues..." />
            </div>
            <div className={styles.tableContainer}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData.map((queue) => (
                    <TableRow key={queue.id}>
                      <TableCell>{queue.id}</TableCell>
                      <TableCell>{queue.name}</TableCell>
                      <TableCell>{queue.status}</TableCell>
                      <TableCell>{queue.priority}</TableCell>
                      <TableCell>{queue.created}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Mini App - Chat */}
        <div className={styles.miniApp}>
          <div className={styles.chatHeader}>
            AI Assistant
          </div>
          <div className={styles.chatArea}>
            <p>Hello! I'm your AI assistant. How can I help you today?</p>
          </div>
          <div className={styles.chatInput}>
            <Input
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => setChatMessage(ev.target.value)}
              onKeyPress={(ev: KeyboardEvent<HTMLInputElement>) => ev.key === 'Enter' && handleChatSend()}
            />
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className={styles.navSidebar}>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" fill="var(--colorNeutralForeground1)" />
            <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" fill="var(--colorNeutralForeground1)" />
          </svg>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--colorNeutralForeground1)" />
          </svg>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="var(--colorNeutralForeground1)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default App;
