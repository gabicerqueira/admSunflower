document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://dtobscffuwsfreqxohln.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0b2JzY2ZmdXdzZnJlcXhvaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MzUyMzYsImV4cCI6MjA0MzAxMTIzNn0.Q0TbOqIJLHTx-T9P-5NcPC2ekn4atw8TcU16ifQ0JYM';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    function showMessage(message, isError = false) {
        alert(isError ? `Erro: ${message}` : `Sucesso: ${message}`);
    }

    function getCurrentISODate() {
        return new Date().toISOString();
    }

    // Função para carregar as turmas com base no tipo de ensino
    function carregarTurmas(tipoEnsino) {
        const turmaSelect = document.getElementById('turma-aluno');
        turmaSelect.innerHTML = "<option value=''>Selecione uma turma</option>"; // Limpa as opções anteriores

        let turmas = [];

        // Definindo as turmas com base no tipo de ensino
        if (tipoEnsino === "EFI") {
            turmas = [
                "1º ano A EFI", "1º ano B EFI",
                "2º ano A EFI", "2º ano B EFI",
                "3º ano A EFI", "3º ano B EFI",
                "4º ano A EFI", "4º ano B EFI",
                "5º ano A EFI", "5º ano B EFI"
            ];
        } else if (tipoEnsino === "EFII") {
            turmas = [
                "6º ano A EFII", "6º ano B EFII",
                "7º ano A EFII", "7º ano B EFII",
                "8º ano A EFII", "8º ano B EFII",
                "9º ano A EFII", "9º ano B EFII"
            ];
        } else if (tipoEnsino === "NEM") {
            turmas = [
                "1º ano A NEM", "1º ano B NEM",
                "2º ano A NEM", "2º ano B NEM",
                "3º ano A NEM", "3º ano B NEM"
            ];
        }

        // Adicionando as turmas ao dropdown
        turmas.forEach(turma => {
            const option = new Option(turma, turma);
            turmaSelect.add(option);
        });
    }

    // Evento para mudar as opções de turma com base na seleção do tipo de ensino
    document.getElementById('tipo-ensino-aluno').addEventListener('change', (event) => {
        const tipoEnsino = event.target.value;
        if (tipoEnsino) {
            carregarTurmas(tipoEnsino);
        } else {
            const turmaSelect = document.getElementById('turma-aluno');
            turmaSelect.innerHTML = "<option value=''>Selecione uma turma</option>"; // Limpa as turmas
        }
    });

    // Adicionar aluno
    document.getElementById('form-aluno').addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('nome-aluno').value.trim();
        const turma = document.getElementById('turma-aluno').value.trim();
        const genero = document.getElementById('genero-aluno').value;

        if (!nome || !turma || !genero) {
            showMessage('Todos os campos são obrigatórios.', true);
            return;
        }

        const { error } = await supabaseClient
            .from('alunos')
            .insert([{ nome, turma, genero, criado_em: getCurrentISODate() }]);

        error ? showMessage(error.message, true) : showMessage('Aluno adicionado com sucesso!');
    });

    async function carregarDropdowns() {
        try {
            // Carregar professores
            const { data: professores, error: professoresError } = await supabaseClient
                .from('responsaveis')
                .select('id, nome')
                .eq('tipo', 'professor');

            if (professoresError) throw professoresError;
            const professorSelect = document.getElementById('professor-nome');
            if (professores && professores.length > 0) {
                professores.forEach(({ id, nome }) => {
                    const option = new Option(nome, id);
                    professorSelect.add(option);
                });
            } else {
                professorSelect.innerHTML = '<option value="">Nenhum professor encontrado</option>';
            }

            // Carregar alunos
            const { data: alunos, error: alunosError } = await supabaseClient
                .from('alunos')
                .select('id, nome');

            if (alunosError) throw alunosError;
            const alunoSelect = document.getElementById('aluno-nome');
            if (alunos && alunos.length > 0) {
                alunos.forEach(({ id, nome }) => {
                    const option = new Option(nome, id);
                    alunoSelect.add(option);
                });
            } else {
                alunoSelect.innerHTML = '<option value="">Nenhum aluno encontrado</option>';
            }
        } catch (error) {
            console.error('Erro ao carregar dropdowns:', error.message);
            showMessage('Erro ao carregar dados.', true);
        }
    }


    // Adicionar responsável/professor
    document.getElementById('form-responsavel').addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('nome-responsavel').value.trim();
        const email = document.getElementById('email-responsavel').value.trim();
        const senha = document.getElementById('senha-responsavel').value.trim();
        const aluno_id = document.getElementById('aluno-responsavel-id').value;
        const tipo = document.getElementById('tipo-responsavel').value;

        if (!nome || !email || !senha || !aluno_id || !tipo) {
            showMessage('Todos os campos são obrigatórios.', true);
            return;
        }

        const { error } = await supabaseClient
            .from('responsaveis')
            .insert([{ nome, email, senha, aluno_id, tipo, created_at: getCurrentISODate() }]);

        error ? showMessage(error.message, true) : showMessage(`${tipo} adicionado com sucesso!`);
    });

    // Relacionar professor e aluno
    document.getElementById('form-professor-aluno').addEventListener('submit', async (event) => {
        event.preventDefault();
        const professor_id = document.getElementById('professor-nome').value;
        const aluno_id = document.getElementById('aluno-nome').value;

        if (!professor_id || !aluno_id) {
            showMessage('Selecione um professor e um aluno.', true);
            return;
        }

        const { error } = await supabaseClient
            .from('professor_aluno')
            .insert([{ professor_id, aluno_id }]);

        error ? showMessage(error.message, true) : showMessage('Relacionamento adicionado com sucesso!');
    });

    carregarDropdowns();
});
