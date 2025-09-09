import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  familyMemberId: string;
  method: 'EMAIL' | 'WHATSAPP';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Family invitation Edge Function called');
    console.log('📝 Request method:', req.method);
    console.log('🌐 Request origin:', req.headers.get('origin'));
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Parse request body
    const requestBody = await req.json();
    console.log('📦 Request body:', requestBody);

    // Handle test requests
    if (requestBody.test) {
      console.log('🧪 Test request received');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Edge Function is available and responding',
          test: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const { familyMemberId, method }: InvitationRequest = requestBody;

    if (!familyMemberId || !method) {
      console.error('❌ Missing required fields:', { familyMemberId, method });
      throw new Error('Missing required fields: familyMemberId, method');
    }

    console.log('✅ Request validated:', { familyMemberId, method });

    // Get family member details
    console.log('👥 Fetching family member details...');
    const { data: familyMember, error: familyError } = await supabaseAdmin
      .from('family_members')
      .select('*')
      .eq('id', familyMemberId)
      .eq('student_id', user.id) // Ensure user can only invite their own family members
      .single()

    if (familyError || !familyMember) {
      console.error('❌ Family member not found:', familyError);
      throw new Error('Family member not found or access denied');
    }

    console.log('✅ Family member found:', familyMember.name);

    // Validate contact information
    if (method === 'EMAIL' && !familyMember.email) {
      throw new Error('Email address is required for email invitations')
    }
    if (method === 'WHATSAPP' && !familyMember.phone) {
      throw new Error('Phone number is required for WhatsApp invitations')
    }

    // Create invitation log entry
    console.log('📝 Creating invitation log entry...');
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations_log')
      .insert({
        family_member_id: familyMemberId,
        sent_by_student_id: user.id,
        invite_method: method,
      })
      .select()
      .single()

    if (invitationError) {
      console.error('❌ Failed to create invitation log:', invitationError);
      throw new Error(`Failed to create invitation log: ${invitationError.message}`);
    }

    console.log('✅ Invitation log created:', invitation.id);

    // Send invitation based on method
    if (method === 'EMAIL') {
      // Use Supabase Auth admin to invite user by email
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        familyMember.email,
        {
          data: {
            family_member_id: familyMemberId,
            student_id: user.id,
            invited_by: user.email,
            invitation_token: invitation.invitation_token,
            family_member_name: familyMember.name,
            relation: familyMember.relation,
            role: 'family_member',
          },
          redirectTo: `${req.headers.get('origin') || 'http://localhost:5173'}/convite/aceitar?token=${invitation.invitation_token}`,
        }
      )

      if (authError) {
        console.error('Error sending email invitation:', authError)
        
        // Update invitation log with error status
        await supabaseAdmin
          .from('invitations_log')
          .update({ invite_status: 'EXPIRED' })
          .eq('id', invitation.id)
        
        throw new Error(`Failed to send email invitation: ${authError.message}`)
      }

      console.log('Email invitation sent successfully:', authData)
    }

    // Update family member status to SENT
    const { error: updateError } = await supabaseAdmin
      .from('family_members')
      .update({ invitation_status: 'SENT' })
      .eq('id', familyMemberId)

    if (updateError) {
      console.error('Error updating family member status:', updateError)
      throw new Error(`Failed to update family member status: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${method} invitation sent successfully`,
        invitation_id: invitation.id,
        invitation_token: invitation.invitation_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in send-family-invitation function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
