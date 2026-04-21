document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('survey-form');
    const successMessage = document.getElementById('success-message');
    const container = document.querySelector('.container');

    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-button');
        const originalBtnText = submitBtn.innerHTML;
        
        // Collect form data
        const formData = new FormData(surveyForm);
        
        // Prepare data for the proxy (n8n)
        // SECURITY IMPROVEMENT: We no longer send data to Airtable directly from the client.
        // This prevents the Airtable Token from being stolen.
        const payload = {
            IDEstudiante: formData.get('id_estudiante'),
            NivelSatisfaccion: parseInt(formData.get('nivel_satisfaccion')),
            ClaridadContenido: parseInt(formData.get('claridad_contenido')),
            AplicabilidadPractica: parseInt(formData.get('aplicabilidad_practica')),
            ComentariosAdicionales: formData.get('comentarios_adicionales') || "",
            timestamp: new Date().toISOString()
        };

        // UI Loading State
        submitBtn.innerHTML = '<span class="loading">Procesando...</span>';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // CONFIGURATION: Replace this URL with your production n8n URL when deploying
        const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/test-encuesta';

        try {
            // SECURE ARCHITECTURE: 
            // We only call our private automation server (n8n).
            // n8n will handle the Airtable insertion and the email notification internally.
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error de comunicación con el servidor de seguridad.');
            }

            // Success Transition
            surveyForm.classList.add('hidden');
            document.querySelector('.header').classList.add('hidden');
            successMessage.classList.remove('hidden');
            console.log('✅ Datos enviados de forma segura a n8n.');

        } catch (error) {
            console.error('Security/Network Error:', error);
            alert('Error de seguridad o conexión: ' + error.message);
            
            // Reset button on error
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });

    // Add some micro-interactions: Highlight field groups when an option is selected
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', () => {
            const group = input.closest('.rating-group');
            group.style.borderColor = 'rgba(65, 105, 225, 0.5)';
            group.style.background = 'rgba(65, 105, 225, 0.05)';
        });
    });
});
