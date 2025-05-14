
   

    // Functie om de header in te laden
    function loadHeader() {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('header-container').innerHTML = data;
            })
            .catch(error => console.error('Error loading the header:', error));
    }

    // Functie om de footer in te laden
    function loadFooter() {
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('footer-container').innerHTML = data;
            })
            .catch(error => console.error('Error loading the footer:', error));
    }

    // Laad de header en footer zodra de pagina is geladen
    window.onload = function() {
        loadHeader();
        loadFooter();
        
        // Add global toggle functions
        window.toggleMenu = function() {
            const nav = document.getElementById('nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (nav && hamburger) {
                nav.classList.toggle('active');
                hamburger.classList.toggle('active');
            }
        };

        window.toggleDarkMode = function() {
            const body = document.documentElement;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        };

        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    };