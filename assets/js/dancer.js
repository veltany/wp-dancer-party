document.addEventListener('DOMContentLoaded', function() {
    // Get localized data passed from WordPress
    const dancerCount = wpdancer_plugin.dancer_count || 5;
    const dancerGIF = wpdancer_plugin.custom_dancer || wpdancer_plugin.url + 'assets/images/default-dancer.gif';
    const sensitivity = wpdancer_plugin.sensitivity || 100;
    const visibility = wpdancer_plugin.visibility === 'on' ? true : false;
    const dancersGIF = wpdancer_plugin.dancers || wpdancer_plugin.url + 'assets/images/default-dancer.gif';

    const audios = document.querySelectorAll('audio');
    const container = document.createElement('div');
    container.id = 'wpdancer-dancers-container';
    document.body.appendChild(container);

    const dancers = [];

    // Create a dancer
    function createDancer(dancerSrc) {
        const dancer = document.createElement('img');
        dancer.src = dancerSrc; 
        dancer.classList.add('wpdancer');
        dancer.style.top = Math.random() * (window.innerHeight - 100) + 'px';
        dancer.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        container.appendChild(dancer);
        dancers.push(dancer);
    }

    // Move dancers randomly
    function moveDancer(dancer) {
        dancer.style.top = Math.random() * (window.innerHeight - 100) + 'px';
        dancer.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    }

    // Start dancing
    function startDancing() {
        
         numDancers = dancersGIF.length ;
         n = 0;
         
        if (dancers.length === 0) {
            for (let i = 0; i < dancerCount; i++)
            {
                createDancer(dancersGIF[n]);
                setInterval(() => moveDancer(dancers[i]), sensitivity * 30);
            
                if (n < numDancers) n = n+1; 
                if (n === numDancers ) n=0;
        } 
            
        }
        dancers.forEach(d => d.classList.remove('resting'));
        dancers.forEach(d => d.classList.remove('hide'));
       
    }

    // Stop dancing
    function stopDancing() {
        dancers.forEach(dancer => {
            dancer.classList.add('resting');
        });
    }
    
    // Hide dancing
    function hideDancing() {
        dancers.forEach(dancer => {
            dancer.classList.add("hide");
        });
    }


    audios.forEach(audio => {
        audio.addEventListener('play', function() {
            startDancing();
        });

        audio.addEventListener('pause', function() {
            if (visibility) hideDancing(); else stopDancing();
        });

        audio.addEventListener('ended', function() {
            if (visibility) stopDancing(); else hideDancing();
        });
    });
});
