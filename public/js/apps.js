// login.js

// Function to handle form submission
function handleLogin() {
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Create an object with the form data
    const formData = { email, password };
  
    // Send a POST request to the login route
    fetch('/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Check if login was successful
        if (data.error) {
          // Display error message on the login page
          const errorContainer = document.getElementById('error');
          errorContainer.innerText = data.error;
        } else {
          // Redirect to the topics page
          window.location.href = '/topics';
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  // Event listener for form submission
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
  });
  