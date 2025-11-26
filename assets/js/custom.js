document.addEventListener("DOMContentLoaded", function() {
    const forma = document.querySelector('.php-email-form');
    const rezultatuText = document.getElementById('rezultatuText');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = forma.querySelector('button[type="submit"]');

    submitBtn.disabled = true;

    function validateField(input) {
        const errorDiv = input.nextElementSibling;
        let valid = true;
        let message = '';

        if (input.name === 'vardas' || input.name === 'pavarde') {
            if (!input.value.trim()) {
                valid = false;
                message = 'Laukas negali būti tuščias.';
            } else if (!/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$/.test(input.value)) {
                valid = false;
                message = 'Galima įvesti tik raides.';
            }
        } else if (input.name === 'email') {
            if (!input.value.trim()) {
                valid = false;
                message = 'Laukas negali būti tuščias.';
            } else if (!/^\S+@\S+\.\S+$/.test(input.value)) {
                valid = false;
                message = 'Neteisingas el. pašto formatas.';
            }
        } else if (input.name === 'adresas') {
            if (!input.value.trim()) {
                valid = false;
                message = 'Laukas negali būti tuščias.';
            }
        }

        if (!valid) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }

        checkFormValidity();
        return valid;
    }

    const inputs = forma.querySelectorAll('input[name="vardas"], input[name="pavarde"], input[name="email"], input[name="adresas"]');
    inputs.forEach(input => {
        input.addEventListener('input', () => validateField(input));
    });

    const phoneInput = forma.querySelector('input[name="telefonas"]');
    phoneInput.addEventListener('input', function() {
        let numbers = phoneInput.value.replace(/\D/g, '');

        if (numbers.startsWith('370')) numbers = numbers.slice(3);
        else if (numbers.startsWith('86')) numbers = numbers.slice(1);
        else if (numbers.startsWith('6')) numbers = numbers;

        numbers = numbers.slice(0, 8);

        let formatted = '';
        if (numbers.length > 0) formatted = '+370 ' + numbers.slice(0,3);
        if (numbers.length > 3) formatted += ' ' + numbers.slice(3);

        phoneInput.value = formatted;
        checkFormValidity();
    });

    function checkFormValidity() {
        let allValid = true;
        inputs.forEach(input => {
            if (!input.classList.contains('valid')) allValid = false;
        });
        if (phoneInput.value.replace(/\D/g, '').length < 9) allValid = false;
        submitBtn.disabled = !allValid;
    }

    forma.addEventListener('submit', function(e) {
        e.preventDefault();

        let allValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) allValid = false;
        });
        if (phoneInput.value.replace(/\D/g, '').length < 9) allValid = false;
        if (!allValid) return;

        const formData = {
            vardas: forma.querySelector('input[name="vardas"]').value,
            pavarde: forma.querySelector('input[name="pavarde"]').value,
            email: forma.querySelector('input[name="email"]').value,
            telefonas: phoneInput.value,
            adresas: forma.querySelector('input[name="adresas"]').value,
            klausimas1: forma.querySelector('input[name="klausimas1"]').value,
            klausimas2: forma.querySelector('input[name="klausimas2"]').value,
            klausimas3: forma.querySelector('input[name="klausimas3"]').value
        };

        const klausimai = [
            Number(formData.klausimas1),
            Number(formData.klausimas2),
            Number(formData.klausimas3)
        ];
        const vidurkis = (klausimai[0] + klausimai[1] + klausimai[2]) / 3;

        rezultatuText.textContent = `
Vardas: ${formData.vardas}
Pavardė: ${formData.pavarde}
El. paštas: ${formData.email}
Tel. Numeris: ${formData.telefonas}
Adresas: ${formData.adresas}
Klausimas 1: ${formData.klausimas1}
Klausimas 2: ${formData.klausimas2}
Klausimas 3: ${formData.klausimas3}

${formData.vardas} ${formData.pavarde}: ${vidurkis.toFixed(1)}
        `;

        successMessage.style.display = 'block';
        setTimeout(() => successMessage.style.display = 'none', 3000);
    });
});