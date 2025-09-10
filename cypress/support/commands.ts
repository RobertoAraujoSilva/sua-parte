// Custom Cypress commands
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginAsAdmin', () => {
  cy.window().then((win) => {
    win.eval(`
      (async () => {
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
        const supabase = createClient(
          'https://nwpuurgwnnuejqinkvrh.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak'
        );
        
        await supabase.auth.signInWithPassword({
          email: '${Cypress.env('ADMIN_EMAIL')}',
          password: '${Cypress.env('ADMIN_PASSWORD')}'
        });
      })()
    `);
  });
})