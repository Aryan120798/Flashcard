document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('explain-form');
    const spinner = document.getElementById('spinner');
    const explanationSection = document.getElementById('explanation-section');
    const explanationOutput = document.getElementById('explanation-output');
    const imageLoading = document.getElementById('image-loading');
    const imageSection = document.getElementById('image-section');
    const generatedImage = document.getElementById('generated-image');

    document.querySelector("input[name='topic']").focus();

    if (performance.navigation.type === 1) {
        // Page was reloaded
        window.location.href = '/refresh';
    }

    function typeText(element, markdown, speed = 100) {
        const htmlContent = marked.parse(markdown);
        element.innerHTML = htmlContent;

        const words = element.innerText.split(/\s+/);
        element.innerHTML = '';
        let wordIndex = 0;

        function typeWord() {
            if (wordIndex < words.length) {
                element.innerHTML += words[wordIndex] + ' ';
                wordIndex++;
                setTimeout(typeWord, speed);
            } else {
                // Restore the full HTML content with formatting
                element.innerHTML = htmlContent;
            }
        }

        typeWord();
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const topic = document.querySelector("input[name='topic']").value;
        const domain = document.querySelector("input[name='domain']").value;

        // Get the level from the focused button or default to '5 year old' if none is focused
        const focusedButton = document.querySelector("button[type='submit']:focus");
        const level = focusedButton ? focusedButton.value : '5 year old';

        spinner.style.visibility = 'visible';
        explanationSection.style.display = 'none';
        imageLoading.style.display = 'none';
        imageSection.style.display = 'none';

        // Generate explanation
        fetch('/generate_explanation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic, domain: domain, level: level }),
        })
            .then(response => response.json())
            .then(data => {
                explanationSection.style.display = 'block';
                spinner.style.visibility = 'hidden';
                imageLoading.style.display = 'flex';
                typeText(explanationOutput, data.explanation, 50); // 50ms delay between words
            })
            .catch((error) => {
                console.error('Error:', error);
                spinner.style.visibility = 'hidden';
            });

        // Generate image
        fetch('/generate_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic, domain: domain, level: level }),
        })
            .then(response => response.json())
            .then(data => {
                generatedImage.src = data.image_url;
                imageLoading.style.display = 'none';
                imageSection.style.display = 'block';

                // Scroll to the image section
                setTimeout(() => {
                    imageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 200); // Small delay to ensure the image is fully rendered
            })
            .catch((error) => {
                console.error('Error:', error);
                imageLoading.style.display = 'none';
            });
    });

    // Add click event listeners to buttons to ensure they get focus
    const buttons = document.querySelectorAll("button[type='submit']");
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            this.focus();
        });
    });
});