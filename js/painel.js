document.addEventListener('DOMContentLoaded', () => { 
    const SUPABASE_URL = 'https://dtobscffuwsfreqxohln.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0b2JzY2ZmdXdzZnJlcXhvaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MzUyMzYsImV4cCI6MjA0MzAxMTIzNn0.Q0TbOqIJLHTx-T9P-5NcPC2ekn4atw8TcU16ifQ0JYM';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const listaAlunos = document.getElementById('lista-alunos');

    async function carregarAlunos() {
        try {
            const { data, error } = await supabaseClient
                .from('alunos')
                .select('foto_perfil, nome, turma');

            if (error) {
                console.error('Erro ao buscar alunos:', error);
                return;
            }

            // Ordenar alunos pelo nome em ordem alfabética
            data.sort((a, b) => a.nome.localeCompare(b.nome));

            listaAlunos.innerHTML = '';
            data.forEach(aluno => {
                const alunoCard = document.createElement('div');
                alunoCard.className = 'aluno-card';

                alunoCard.innerHTML = `
                    <img src="${aluno.foto_perfil}" alt="Foto de ${aluno.nome}">
                    <h3>${aluno.nome}</h3>
                    <p>Turma: ${aluno.turma}</p>
                `;

                listaAlunos.appendChild(alunoCard);
            });
        } catch (erro) {
            console.error('Erro inesperado:', erro);
        }
    }

    carregarAlunos();
});
