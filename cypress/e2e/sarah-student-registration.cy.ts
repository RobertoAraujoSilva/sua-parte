describe('Sarah Student Registration - Complete Birth Date Feature Test', () => {
  // Test user data for Sarah
  const sarahData = {
    fullName: 'Sarah Rackel Ferreira Lima',
    email: 'franklima.flm@gmail.com',
    password: 'test@123',
    dateOfBirth: '2009-09-25', // September 25, 2009
    congregation: 'Market Harborough',
    role: 'estudante',
    cargo: 'publicador_nao_batizado' // Appropriate for 14-year-old
  }

  // Calculate expected age
  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const expectedAge = calculateAge(sarahData.dateOfBirth)

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should complete Sarah\'s student registration with birth date validation', () => {
    cy.log('🧪 Testing Sarah\'s Student Registration with Birth Date Feature')
    cy.log(`👤 Student: ${sarahData.fullName}`)
    cy.log(`📧 Email: ${sarahData.email}`)
    cy.log(`🎂 Birth Date: ${sarahData.dateOfBirth} (Expected Age: ${expectedAge})`)
    cy.log(`⛪ Congregation: ${sarahData.congregation}`)
    
    // Step 1: Navigate to registration form
    cy.log('📍 Step 1: Navigating to registration form')
    cy.visit('/auth')
    cy.waitForPageLoad()
    cy.shouldBeOnPage('/auth')

    // Step 2: Switch to signup tab
    cy.log('📝 Step 2: Switching to signup tab')
    cy.get('[data-testid="signup-tab"], button:contains("Criar Conta"), [role="tab"]:contains("Criar")')
      .should('be.visible')
      .click()

    // Step 3: Select student account type
    cy.log('🎭 Step 3: Selecting student account type')
    cy.get('div:contains("Estudante")')
      .should('be.visible')
      .click()

    // Verify student account type is selected
    cy.get('div:contains("Estudante")')
      .should('have.class', 'border-jw-blue')

    // Step 4: Fill in personal information
    cy.log('👤 Step 4: Filling in personal information')
    
    // Full Name
    cy.get('input[id*="nome"], input[placeholder*="nome"], label:contains("Nome Completo")')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type(sarahData.fullName)

    // Birth Date - NEW FEATURE TEST
    cy.log('🎂 Step 4a: Testing birth date field (NEW FEATURE)')
    cy.get('input[type="date"], input[id*="birth"], label:contains("Data de Nascimento")')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type(sarahData.dateOfBirth)

    // Verify age calculation appears
    cy.log('📊 Step 4b: Verifying age calculation')
    cy.get('body').should('contain.text', `${expectedAge} anos`)
    
    // Verify age validation passes (should be green/valid)
    cy.get('p:contains("anos"), span:contains("anos")')
      .should('be.visible')
      .and('not.contain.text', 'mínima')
      .and('not.contain.text', 'erro')

    // Congregation
    cy.get('input[id*="congregacao"], input[placeholder*="congregação"], label:contains("Congregação")')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type(sarahData.congregation)

    // Ministerial Role (for students)
    cy.log('📋 Step 4c: Selecting ministerial role')
    cy.get('select, [role="combobox"], button:contains("Selecione seu cargo")')
      .should('be.visible')
      .click()

    cy.get('option:contains("Publicador Não Batizado"), [role="option"]:contains("Publicador Não Batizado")')
      .should('be.visible')
      .click()

    // Step 5: Fill in account credentials
    cy.log('🔐 Step 5: Filling in account credentials')
    
    // Email
    cy.get('input[type="email"], input[id*="email"], label:contains("E-mail")')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type(sarahData.email)

    // Password
    cy.get('input[type="password"], input[id*="password"]:first, label:contains("Senha")')
      .parent()
      .find('input')
      .first()
      .should('be.visible')
      .clear()
      .type(sarahData.password)

    // Confirm Password
    cy.get('input[type="password"], input[id*="confirm"], label:contains("Confirmar")')
      .parent()
      .find('input')
      .last()
      .should('be.visible')
      .clear()
      .type(sarahData.password)

    // Step 6: Submit registration
    cy.log('🚀 Step 6: Submitting registration form')
    cy.get('button[type="submit"], button:contains("Criar Conta"), button:contains("Cadastrar")')
      .should('be.visible')
      .and('not.be.disabled')
      .click()

    // Step 7: Verify successful registration
    cy.log('✅ Step 7: Verifying successful registration')
    
    // Wait for registration to complete and redirect
    cy.url({ timeout: 30000 }).should('satisfy', (url: string) => {
      return url.includes('/estudante/') || url.includes('success') || url.includes('portal')
    })

    // If redirected to student portal, capture the user ID
    cy.url().then((url) => {
      if (url.includes('/estudante/')) {
        const userId = url.split('/estudante/')[1]
        cy.log(`👤 Sarah's User ID: ${userId}`)
        
        // Store for later use
        cy.wrap(userId).as('sarahUserId')
      }
    })

    // Step 8: Verify profile creation in database
    cy.log('🗄️ Step 8: Verifying profile creation in database')
    
    // Wait for profile to be created
    cy.wait(3000)

    // Check if we're on the student portal
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sarah') || $body.text().includes('Bem-vindo')) {
        cy.log('✅ Successfully redirected to student portal')
        
        // Step 9: Verify birth date display in portal
        cy.log('🎂 Step 9: Verifying birth date display in student portal')
        
        // Check for birth date in personal information section
        cy.get('body').should('contain.text', 'Sarah Rackel Ferreira Lima')
        
        // Look for birth date display (could be in various formats)
        cy.get('body').should('satisfy', ($body) => {
          const text = $body.text()
          return text.includes('25/09/2009') || 
                 text.includes('2009-09-25') || 
                 text.includes('setembro') ||
                 text.includes(`${expectedAge} anos`)
        })

        // Verify age is displayed
        cy.get('body').should('contain.text', `${expectedAge} anos`)
        
        // Verify congregation is displayed
        cy.get('body').should('contain.text', 'Market Harborough')
        
        cy.log('✅ Birth date and age correctly displayed in student portal')
      }
    })

    cy.log('🎉 Sarah\'s registration test completed successfully!')
  })

  it('should allow Sarah to login and access her student portal', () => {
    cy.log('🔐 Testing Sarah\'s login and portal access')
    
    // Navigate to login
    cy.visit('/auth')
    cy.waitForPageLoad()

    // Ensure we're on the sign-in tab
    cy.get('[data-testid="signin-tab"], button:contains("Entrar"), [role="tab"]:contains("Entrar")')
      .should('be.visible')
      .click()

    // Fill login credentials
    cy.log('📧 Filling login credentials')
    cy.get('input[type="email"]')
      .should('be.visible')
      .clear()
      .type(sarahData.email)

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(sarahData.password)

    // Submit login
    cy.get('button[type="submit"], button:contains("Entrar")')
      .should('be.visible')
      .click()

    // Verify successful login and redirect
    cy.log('🔄 Verifying login and redirect')
    cy.url({ timeout: 30000 }).should('include', '/estudante/')

    // Verify Sarah's portal content
    cy.log('📋 Verifying Sarah\'s portal content')
    cy.get('body').should('contain.text', 'Sarah')
    cy.get('body').should('contain.text', 'Market Harborough')
    cy.get('body').should('contain.text', `${expectedAge} anos`)

    cy.log('✅ Sarah can successfully login and access her portal')
  })

  it('should validate birth date edge cases', () => {
    cy.log('🧪 Testing birth date validation edge cases')
    
    cy.visit('/auth')
    cy.waitForPageLoad()

    // Switch to signup
    cy.get('[data-testid="signup-tab"], button:contains("Criar Conta"), [role="tab"]:contains("Criar")')
      .click()

    // Select student type
    cy.get('div:contains("Estudante")').click()

    // Test future date (should be invalid)
    cy.log('📅 Testing future date validation')
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    cy.get('input[type="date"]')
      .clear()
      .type(futureDateStr)

    // Should show error for future date
    cy.get('body').should('contain.text', 'futuro')

    // Test too young (should be invalid)
    cy.log('👶 Testing too young validation')
    cy.get('input[type="date"]')
      .clear()
      .type('2020-01-01') // About 4 years old

    // Should show minimum age error
    cy.get('body').should('contain.text', 'mínima')

    // Test valid date (Sarah's birth date)
    cy.log('✅ Testing valid date')
    cy.get('input[type="date"]')
      .clear()
      .type(sarahData.dateOfBirth)

    // Should show valid age
    cy.get('body').should('contain.text', `${expectedAge} anos`)
    cy.get('body').should('not.contain.text', 'mínima')
    cy.get('body').should('not.contain.text', 'futuro')

    cy.log('✅ Birth date validation working correctly')
  })
})
