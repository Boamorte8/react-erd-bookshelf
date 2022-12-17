import * as React from 'react'
import {createRoot} from 'react-dom/client'
import {Logo} from './components/logo'
import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css'

const container = document.getElementById('root')

function LoginForm({onSubmit, buttonText}) {
  const handleSubmit = event => {
    event.preventDefault()
    const {username, password} = event.target.elements
    onSubmit({
      username: username.value,
      password: password.value,
    })
  }
  return (
    <form
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '.75rem',
      }}
      onSubmit={handleSubmit}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" />
      </div>
      <button>{buttonText}</button>
    </form>
  )
}

function App() {
  const [openDialog, setOpenDialog] = React.useState(null)

  const onClose = () => {
    setOpenDialog(null)
  }

  const handleLogin = data => {
    console.log('Handle Login', data)
  }
  const handleRegister = data => {
    console.log('Handle Register', data)
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 1rem)',
      }}
    >
      <Logo />
      <h1>Bookshelf</h1>
      <div style={{display: 'flex', gap: '0.5rem'}}>
        <button onClick={() => setOpenDialog('login')}>Login</button>
        <button onClick={() => setOpenDialog('register')}>Register</button>
      </div>

      <Dialog
        aria-label="Login form"
        isOpen={openDialog === 'login'}
        onDismiss={onClose}
      >
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button className="close-button" onClick={onClose}>
            <span aria-hidden>×</span>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '.75rem',
          }}
        >
          <h2>Login</h2>
          <LoginForm onSubmit={handleLogin} buttonText="Login" />
        </div>
      </Dialog>

      <Dialog
        aria-label="Registration form"
        isOpen={openDialog === 'register'}
        onDismiss={onClose}
      >
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button className="close-button" onClick={onClose}>
            <span aria-hidden>×</span>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '.75rem',
          }}
        >
          <h2>Register</h2>
          <LoginForm onSubmit={handleRegister} buttonText="Register" />
        </div>
      </Dialog>
    </div>
  )
}

createRoot(container).render(<App />)

// 🐨 you'll need to import react and createRoot from react-dom up here

// 🐨 you'll also need to import the Logo component from './components/logo'

// 🐨 create an App component here and render the logo, the title ("Bookshelf"), a login button, and a register button.
// 🐨 for fun, you can add event handlers for both buttons to alert that the button was clicked

// 🐨 use createRoot to render the <App /> to the root element
// 💰 find the root element with: document.getElementById('root')
