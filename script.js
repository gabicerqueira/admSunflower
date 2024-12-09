document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = 'https://dtobscffuwsfreqxohln.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0b2JzY2ZmdXdzZnJlcXhvaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MzUyMzYsImV4cCI6MjA0MzAxMTIzNn0.Q0TbOqIJLHTx-T9P-5NcPC2ekn4atw8TcU16ifQ0JYM';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const { data, error } = await supabaseClient
                .from('adm')
                .select('empresa, email, senha') // Inclua 'empresa' aqui
                .eq('email', email)
                .eq('senha', senha)
                .single();
    
            if (error || !data) {
                alert('Login ou senha incorretos!');
            } else {
                // Salvar o nome da empresa no localStorage
                localStorage.setItem('empresa', data.empresa);
                
                alert('Login realizado com sucesso!');
                window.location.href = '../html/painel.html';
            }
        } catch (err) {
            console.error('Erro ao tentar logar:', err.message);
        }
    });
});
