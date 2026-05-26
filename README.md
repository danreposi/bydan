# bydan.com.br — arquivo pessoal

Site pessoal de Dan. Hospedado no GitHub Pages com domínio customizado `bydan.com.br`.

---

## Estrutura de arquivos

```
bydan/
├── index.html          ← site público
├── CNAME               ← domínio customizado
├── data/
│   └── content.json    ← todo o conteúdo do site
└── admin/
    └── index.html      ← painel de administração (protegido por senha)
```

---

## Deploy no GitHub Pages

### 1. Criar o repositório

```bash
git init
git remote add origin https://github.com/SEU_USUARIO/bydan.git
```

### 2. Ativar GitHub Pages

- Vá em **Settings → Pages**
- Source: `Deploy from a branch`
- Branch: `main` → `/ (root)`
- Salvar

### 3. Configurar domínio customizado

O arquivo `CNAME` já está configurado com `bydan.com.br`.

No painel do seu registrador de domínio, adicione estes registros DNS:

```
Tipo    Nome    Valor
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     SEU_USUARIO.github.io
```

Aguarde a propagação DNS (pode levar até 24h).

---

## Fluxo de publicação de conteúdo

O site usa `localStorage` para edições rápidas e `data/content.json` como fonte de verdade permanente.

### Fluxo completo:

```
1. Acesse bydan.com.br/admin/
2. Faça login com sua senha de admin
3. Edite posts, projetos ou textos do site
4. Clique em [ PUBLISH ]
5. Clique em [ baixar arquivo ] ou copie o JSON
6. Substitua data/content.json no repositório
7. Commit + push → GitHub Pages atualiza em ~1 min
```

### Comando rápido de publicação:

```bash
# Após baixar o content.json do painel admin:
cp ~/Downloads/content.json data/content.json
git add data/content.json
git commit -m "conteúdo: [descrição da mudança]"
git push
```

---

## Acesso ao painel admin

**URL:** `bydan.com.br/admin/`

**Senha padrão:** `admin`

> ⚠️ **IMPORTANTE:** Troque a senha padrão imediatamente após o primeiro login.
> Vá em **Config → Alterar Senha**.

A senha é armazenada como hash SHA-256 no `localStorage` do navegador.
Se esquecer a senha, limpe o localStorage do navegador e a senha volta ao padrão `admin`.

---

## Funcionalidades do painel admin

### Blog
- Criar, editar e excluir posts
- Editor rich text (negrito, itálico, títulos, citações, links)
- Incorporar vídeos do YouTube, Vimeo ou MP4 direto
- Imagem de capa (upload Base64)
- Anexos: imagens, vídeos, PDFs, ZIPs
- Tags
- Rascunho ou publicado

### Projetos
- Criar, editar e excluir projetos
- Imagem de capa
- Links para itch.io, GitHub e demo
- Tags
- Status publicado/rascunho (rascunhos ficam ocultos no site)

### Editor do Site
- Todos os textos editáveis: banner, marquee, sobre, filosofia, stack, contato, footer
- Adicionar/remover caixas de novidades
- Adicionar/remover ferramentas do stack com barra de progresso
- Adicionar/remover links de contato

### Config
- Alterar senha de administrador
- Exportar/importar content.json
- Limpar dados locais

---

## Notas técnicas

- **Sem backend** — tudo é estático, compatível com GitHub Pages
- **Imagens** são salvas como Base64 no JSON (ideal para imagens pequenas)
- Para imagens grandes, hospede externamente (Imgur, Cloudinary) e cole a URL
- **Vídeos** grandes devem ser hospedados no YouTube/Vimeo e incorporados
- O painel admin é acessível publicamente pela URL, mas protegido por senha
- Sessão de admin dura 8 horas

---

## Licença

Pessoal. Não reutilize sem permissão.
