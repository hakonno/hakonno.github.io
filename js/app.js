document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();

    fetch('data/content.json')
        .then(res => res.json())
        .then(data => {
            window.contentData = data;
            renderSocials(data.profile.socials);
            window.addEventListener('hashchange', router);
            router();
        });
});

function router() {
    const hash = window.location.hash || '#home';
    if (hash === '#home') {
        renderHome(window.contentData);
    } else if (hash === '#blog') {
        renderBlogList(window.contentData.blogPosts);
    } else if (hash.startsWith('#blog/')) {
        const postId = hash.split('/')[1];
        const post = window.contentData.blogPosts.find(p => p.id === postId);
        renderPost(post);
    }
    window.scrollTo(0, 0);
}

function renderSocials(socials) {
    const navLinks = document.querySelector('.nav-links');
    navLinks.innerHTML = '<a href="#home">Projects</a><a href="#blog">Blog</a>';
    socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url;
        a.textContent = social.label;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        navLinks.appendChild(a);
    });
}

function renderHome(data) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header class="home-header">
            <h1>${data.profile.name}</h1>
            <p class="subtitle">${data.profile.title}</p>
            <p class="about-text">${data.profile.about}</p>
        </header>
        <section id="projects">
            <h2 class="section-title">Projects</h2>
            <div id="projects-list"></div>
        </section>
    `;

    const list = document.getElementById('projects-list');
    data.projects.forEach(project => {
        const div = document.createElement('div');
        div.className = 'project-card';
        const links = project.links.map(l => `<a href="${l.url}" class="project-link">${l.label}</a>`).join('');

        div.innerHTML = `
            <h3>${project.title}</h3>
            <p class="tagline">${project.tagline}</p>
            <p class="description">${project.description}</p>
            <div class="project-actions">${links}</div>
        `;
        list.appendChild(div);
    });
}

function renderBlogList(posts) {
    const app = document.getElementById('app');
    app.innerHTML = '<h2 class="section-title">Blog</h2><div id="blog-list"></div>';
    const list = document.getElementById('blog-list');
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'blog-item';
        div.innerHTML = `
            <a href="#blog/${post.id}">
                <h3>${post.title}</h3>
                <span class="date">${post.date}</span>
                <p>${post.intro}</p>
            </a>
        `;
        list.appendChild(div);
    });
}

function renderPost(post) {
    if (!post) {
        document.getElementById('app').innerHTML = '<h2>Post not found</h2><a href="#blog">Back to blog</a>';
        return;
    }

    let mediaHtml = '';
    if (post.video) {
        mediaHtml = `
            <figure class="post-media">
                <video controls muted playsinline aria-label="${post.video.caption}">
                    <source src="${post.video.url}" type="video/webm">
                    Your browser does not support the video tag.
                </video>
                <figcaption>${post.video.caption}</figcaption>
            </figure>
        `;
    }

    const contentHtml = post.content.map(item => {
        if (item.type === 'heading') return `<h2 class="post-h2">${item.text}</h2>`;
        if (item.type === 'divider') return `<hr class="post-hr">`;
        if (item.type === 'image') {
            return `
                <figure class="post-media">
                    <img src="${item.url}" alt="${item.alt || ''}" loading="lazy">
                    ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ''}
                </figure>
            `;
        }
        return `<p class="post-p">${item.body}</p>`;
    }).join('');

    const app = document.getElementById('app');
    app.innerHTML = `
        <nav class="breadcrumb"><a href="#blog">← Blog</a></nav>
        <article class="full-post">
            <header class="post-header">
                <h1>${post.title}</h1>
                <time class="date">${post.date}</time>
            </header>
            <p class="post-intro">${post.intro}</p>
            ${mediaHtml}
            <div class="post-body">
                ${contentHtml}
            </div>
        </article>
    `;
}
