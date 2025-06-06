# ⚽ Pelada PFC - Gestão e Estatísticas

Bem-vindo ao repositório do sistema de gestão e estatísticas da Pelada PFC! Este projeto visa simplificar o registro de informações dos jogos e jogadores, fornecendo estatísticas rápidas e úteis para os participantes.

Desenvolvido como um WebApp integrado ao Google Sheets e Google Apps Script, focado em facilidade de uso e acesso direto via browser.

## 🚀 Funcionalidades Atuais

* **Registro de Jogadores e Estatísticas Individuais:**
    * Adicione jogadores e registre suas presenças.
    * Registre `Assistências` e `Gols` (com seletores simplificados).
    * Indique se o jogador foi `Capitão` na partida.
    * Opcionalmente, informe o `Time` do jogador.
* **Registro de Partidas:**
    * Registre os resultados das partidas (times e placares).
* **Visualização de Estatísticas:**
    * Visualize as estatísticas de jogadores (Gols, Assistências, Presenças, vezes como Capitão) para uma data específica.
    * Acompanhe os pontos dos times.
    * Identifique o time campeão do dia.

## 🛠️ Tecnologias Utilizadas

* **Google Apps Script (GAS):** Lógica de backend para interação com o Google Sheets.
* **Google Sheets:** Banco de dados para armazenar os dados dos jogadores e resultados das partidas.
* **HTML5/CSS3/JavaScript:** Frontend do WebApp, com foco em uma interface simples e responsiva.
* **Flatpickr:** Biblioteca JavaScript para um seletor de data moderno e intuitivo.

## ⚙️ Como Configurar e Rodar

Para utilizar este sistema, você precisará de uma conta Google e acesso ao Google Sheets e Google Apps Script.

### 1. Preparar a Planilha Google Sheets

1.  Crie uma nova planilha no Google Sheets.
2.  Renomeie a primeira aba para `Respostas ao formulário 1`. Esta aba será usada para registrar as estatísticas individuais dos jogadores. As colunas devem ter a seguinte estrutura (mesmo que algumas sejam preenchidas automaticamente ou sejam opcionais pelo app):
    * `Carimbo de data/hora` (A)
    * `Jogador` (B)
    * `Data do Jogo` (C)
    * `Presença` (D)
    * `Assistência` (E)
    * `Gols` (F)
    * `Última Datas` (G)
    * `Capitão` (H)
    * ... (outras colunas até a O, se existirem na sua planilha original, podem ser vazias ou ter seus próprios dados)
    * `Time` (P)

3.  Crie uma segunda aba e renomeie-a para `Jogos_2025`. Esta aba será usada para registrar os resultados das partidas. As colunas devem ter a seguinte estrutura:
    * `Data do Jogo`
    * `Time 1`
    * `Gols Time 1`
    * `Time 2`
    * `Gols Time 2`

4.  **Anote o ID da sua planilha.** Você pode encontrá-lo na URL da planilha, entre `/d/` e `/edit`. Ex: `https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA_AQUI/edit#gid=0`

### 2. Configurar o Google Apps Script

1.  Na sua planilha Google Sheets, vá em `Extensões` > `Apps Script`. Isso abrirá o editor do Google Apps Script.
2.  No editor, você verá um arquivo `Código.gs` (ou `Code.gs`). Apague todo o conteúdo existente nele.
3.  Copie o conteúdo do arquivo `src/codgio.js` deste repositório e cole-o no `Código.gs`.
4.  No topo do arquivo `Código.gs`, você encontrará a constante `PLANILHA_ID`. **Substitua o valor existente pelo ID da planilha que você anotou no passo 4 da seção anterior.**

    ```javascript
    const PLANILHA_ID = "SEU_ID_DA_PLANILHA_AQUI"; // Substitua por seu ID
    ```

5.  Salve o projeto (ícone de disquete ou `Ctrl + S`).
6.  **Deploy como Web App:**
    * Clique em `Implantar` (Deploy) > `Nova implantação` (New deployment).
    * Clique no ícone de engrenagem ao lado de "Tipo" e selecione `Aplicativo da Web` (Web app).
    * Configure:
        * **Descrição:** Pelada PFC - Gestão de Estatísticas
        * **Executar como:** Eu (seu e-mail)
        * **Quem tem acesso:** Qualquer pessoa (para que o WebApp possa ser acessado sem login Google para os usuários) ou Qualquer pessoa, mesmo anônima (se não precisar de autenticação).
    * Clique em `Implantar`.
    * Na primeira vez, você precisará autorizar as permissões. Siga as instruções: `Revisar permissões`, selecione sua conta, clique em `Avançado` e depois em `Acessar Pelada PFC (não seguro)` (o nome do seu projeto Apps Script). Conceda as permissões necessárias.
    * Após a implantação bem-sucedida, você receberá a **URL do Web App**. Copie esta URL.

### 3. Configurar o Frontend (index.html)

1.  Volte ao editor do Google Apps Script.
2.  No menu à esquerda, clique em `Arquivo` > `Novo` > `Arquivo HTML`.
3.  Nomeie o arquivo como `index`.
4.  Copie o conteúdo do arquivo `src/index.html` deste repositório e cole-o no arquivo `index.html` recém-criado no Apps Script.
5.  Salve o arquivo `index.html`.

### 4. Acessar o WebApp

1.  Use a **URL do Web App** que você copiou no passo 6 da configuração do Apps Script.
2.  Cole-a no seu navegador e o WebApp da Pelada PFC estará pronto para uso!

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues para sugestões de melhorias ou para reportar bugs.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---
**Desenvolvido por Christian (Gerente de TI - Integrações, apaixonado por tecnologia e inovação).**
