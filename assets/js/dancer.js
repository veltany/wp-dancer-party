document.addEventListener('DOMContentLoaded', function() {
    // Get localized data passed from WordPress
    const dancerCount = wpdancer_plugin.dancer_count || 5;
    const dancerGIF = wpdancer_plugin.custom_dancer || wpdancer_plugin.url + 'assets/images/default-dancer.gif';
    const sensitivity = wpdancer_plugin.sensitivity || 100;
    const visibility = wpdancer_plugin.visibility === 'on' ? true : false;
    const dancersGIF = wpdancer_plugin.dancers || wpdancer_plugin.url + 'assets/images/default-dancer.gif';

    const audios = document.querySelectorAll('audio');
    audios.crossOrigin = 'anonymous';
    const container = document.createElement('div');
    container.id = 'wpdancer-dancers-container';
    document.body.appendChild(container);

    const dancers = [];
    
    let audioContext;
    let analyser;
    let source;
    let dataArray;

    // Create a dancer
    function createDancer(dancerSrc) {
        const dancer = document.createElement('img');
        dancer.src = dancerSrc; 
        dancer.classList.add('wpdancer');
        
        // Randomize animation style
        const animations = [
        'wpdancer-bounce', 
        'wpdancer-fly', 
        //'wpdancer-spin', 
        'wpdancer-shake', 
        'wpdancer-fade'
        ];
        
        dancer.classList.add(animations[Math.floor(Math.random() * animations.length)]);
        // Random horizontal position
        //dancer.style.top = Math.random() * (window.innerHeight - 100) + 'px';
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

     function animateDancers() {
        if (!analyser) return;

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        let average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        let speed = Math.min(Math.max(average / 80, 0.1), 1); // speed between 0.5x and 3x

        dancers.forEach(dancer => {
            dancer.style.animationDuration = (2 / speed) + 's';
        });

        requestAnimationFrame(animateDancers);
    }


    audios.forEach(audio => {
        audio.crossOrigin = "anonymous";
          
        audio.addEventListener('play', function() {
             if (!audioContext) {
               // audioContext = new (window.AudioContext || window.webkitAudioContext)();
               
               // Try if CORS allowed
                 try {
                 audioContext = new AudioContext();
                 source = audioContext.createMediaElementSource(audio);
                 analyser = audioContext.createAnalyser();
                 source.connect(analyser);
                 analyser.connect(audioContext.destination);
                 console.info("CORS likely okay.");
                }
                 catch (e) {
                      console.warn("Falling back to fake dancing. CORS likely blocked audio processing.");
                  }
            } else if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            startDancing();
            animateDancers();
        });

        audio.addEventListener('pause', function() {
            if (visibility) hideDancing(); else stopDancing();
        });

        audio.addEventListener('ended', function() {
            if (visibility) stopDancing(); else hideDancing();
        });
    });
});
