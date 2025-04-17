document.addEventListener('DOMContentLoaded', function(){
    var container = document.getElementById('wpdancer_custom_dancers');
    var addButton = document.getElementById('wpdancer_add_dancer');

    function updateButtons() {
        var items = container.querySelectorAll('.wpdancer-dancer-item');
        addButton.disabled = items.length >= 3;
    }

    function createDancerField(url = '') {
        var wrapper = document.createElement('div');
        wrapper.className = 'wpdancer-dancer-item';
        wrapper.style.marginBottom = '15px';

        var input = document.createElement('input');
        input.type = 'text';
        input.name = 'wpdancer_options[custom_dancers][]';
        input.value = url;
        input.style.width = '55%';

        var uploadButton = document.createElement('button');
        uploadButton.type = 'button';
        uploadButton.className = 'button wpdancer_upload_button';
        uploadButton.textContent = 'Select Image';

        var removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'button wpdancer_remove_button';
        removeButton.textContent = 'Remove';

        var preview = document.createElement('img');
        preview.className = 'wpdancer-preview';
        preview.style.marginTop = '5px';
        preview.style.maxWidth = '80px';
        preview.style.maxHeight = '80px';
        preview.style.display = 'inline-block';
        if (url) {
            preview.src = url;
        }

        uploadButton.addEventListener('click', function(e) {
            e.preventDefault();
            var frame = wp.media({
                title: 'Select Dancer',
                button: { text: 'Use this dancer' },
                multiple: false
            });
            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                input.value = attachment.url;
                preview.src = attachment.url;
            });
            frame.open();
        });

        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            wrapper.remove();
            updateButtons();
        });

        wrapper.appendChild(input);
        wrapper.appendChild(uploadButton);
        wrapper.appendChild(removeButton);
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(preview);
        container.appendChild(wrapper);

        updateButtons();
    }

    addButton.addEventListener('click', function(e) {
        e.preventDefault();
        createDancerField();
    });

    // Rebind upload and remove buttons for existing fields
    container.querySelectorAll('.wpdancer_upload_button').forEach(function(button){
        button.addEventListener('click', function(e){
            e.preventDefault();
            var wrapper = button.parentElement;
            var input = wrapper.querySelector('input[type="text"]');
            var preview = wrapper.querySelector('.wpdancer-preview');

            var frame = wp.media({
                title: 'Select Dancer',
                button: { text: 'Use this dancer' },
                multiple: false
            });
            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                input.value = attachment.url;
                preview.src = attachment.url;
            });
            frame.open();
        });
    });

    container.querySelectorAll('.wpdancer_remove_button').forEach(function(button){
        button.addEventListener('click', function(e){
            e.preventDefault();
            button.parentElement.remove();
            updateButtons();
        });
    });

    updateButtons();
});
