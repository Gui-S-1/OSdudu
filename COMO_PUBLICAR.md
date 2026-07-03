# 📱 Como colocar o Gestor de OS no ar (passo a passo)

O aplicativo já está **pronto**. Faltam só 3 contas gratuitas para ele funcionar
na internet e no celular de todo mundo: **Supabase** (banco de dados),
**GitHub** (guarda o código) e **Vercel** (coloca o app no ar).
São uns 15 minutos, tudo de graça.

---

## 1️⃣ Supabase — o banco de dados (onde ficam as OS e os logins)

1. Entre em **https://supabase.com** e clique em **Start your project** (pode entrar com o Google).
2. Clique em **New project**. Dê um nome (ex.: `gestor-os`), crie uma senha qualquer para o banco e escolha a região **South America (São Paulo)**. Clique em **Create**.
3. Espere 1–2 minutos até o projeto ficar pronto.
4. No menu da esquerda, clique em **SQL Editor** → **New query**.
5. Abra o arquivo **`supabase/schema.sql`** desta pasta, copie **TUDO** e cole lá. Clique em **RUN**.
   ✅ Isso cria as tabelas e já cria os logins do Eduardo, Declie, Samuel e Jubileu.
6. Ainda no Supabase, vá em **Settings (engrenagem) → API** e deixe essa página aberta.
   Você vai precisar de dois valores:
   - **Project URL** (algo como `https://abcdefg.supabase.co`)
   - **anon public** key (um texto grandão começando com `eyJ...`)

## 2️⃣ GitHub — guardar o código

1. Entre em **https://github.com** e crie uma conta (ou entre na sua).
2. Clique no **+** (canto superior direito) → **New repository**.
3. Nome: `gestor-os` → deixe **Private** → **Create repository**.
4. No seu computador, abra o **Prompt de Comando** dentro da pasta `os-app` e rode
   (troque `SEU-USUARIO` pelo seu usuário do GitHub):

   ```
   git remote add origin https://github.com/SEU-USUARIO/gestor-os.git
   git push -u origin main
   ```

   > O git já está configurado nesta pasta — o commit inicial já foi feito.
   > Na primeira vez o GitHub abre uma janelinha pedindo para você entrar. É só entrar.

## 3️⃣ Vercel — colocar o app no ar

1. Entre em **https://vercel.com** e clique em **Sign up → Continue with GitHub**.
2. Clique em **Add New… → Project** e escolha o repositório **gestor-os**.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione **duas** variáveis
   (com os valores da página do Supabase que ficou aberta):

   | Nome | Valor |
   |------|-------|
   | `VITE_SUPABASE_URL` | o **Project URL** do Supabase |
   | `VITE_SUPABASE_ANON_KEY` | a chave **anon public** do Supabase |

4. Clique em **Deploy**. Em ~1 minuto a Vercel te dá o endereço do app,
   tipo `https://gestor-os.vercel.app` 🎉

## 4️⃣ Instalar no celular de cada um

1. Abra o endereço do app no **Chrome** do celular.
2. Toque nos **3 pontinhos → Adicionar à tela inicial → Instalar**.
3. Pronto! Vira um aplicativo com ícone, tela cheia e notificações.
4. Ao abrir pela primeira vez, o celular pergunta se **permite notificações** → toque em **Permitir**.

> **Quer um APK de verdade?** Depois do app no ar, entre em **https://www.pwabuilder.com**,
> cole o endereço do app e clique em **Package for Android**. Ele gera o `.apk` para instalar.

---

## 🔑 Logins que já vêm criados

| Quem | Usuário | Senha | Pode fazer |
|------|---------|-------|------------|
| **Eduardo** 👑 | `eduardo` | `eduardo123` | Tudo: criar, aprovar, atribuir, concluir OS e criar logins novos |
| Declie | `declie` | `declie123` | Criar OS (vai para aprovação) e marcar as suas como feitas |
| Samuel | `samuel` | `samuel123` | idem |
| Jubileu | `jubileu` | `jubileu123` | idem |

## 🔄 Como funciona o fluxo

1. **Alguém cria uma OS** → se foi a equipe, ela fica **Aguardando aprovação do Eduardo** (ele recebe notificação). Se foi o Eduardo, já nasce **Aberta**.
2. Eduardo **aprova** e escolhe o **responsável** → o responsável recebe notificação.
3. O responsável faz o serviço e toca em **"Já fiz esse serviço"**, dizendo **quando** e **onde** fez → a OS entra **Em análise** (Eduardo recebe notificação).
4. Eduardo confere e toca em **"Confirmei — concluir OS"** → a OS vai para o **Histórico, verdinha** ✅ (todo mundo recebe notificação). Se não foi feito, ele devolve para **Aberta**.
5. O Eduardo também pode **concluir direto** qualquer OS, inclusive com **data retroativa**.

As prioridades (🔴 Urgente, 🟠 Alta, 🟡 Média, 🟢 Baixa) ordenam a lista e têm filtro em cima da tela.
