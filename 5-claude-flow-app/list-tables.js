#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function listAllTables() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Get all tables from information_schema
        const { data: tables, error } = await supabase
            .rpc('get_all_tables');
            
        if (error) {
            // Fallback: try to query information_schema directly
            console.log('Attempting to query information_schema directly...');
            
            const { data: schemaData, error: schemaError } = await supabase
                .from('information_schema.tables')
                .select('*')
                .eq('table_type', 'BASE TABLE');
                
            if (schemaError) {
                console.error('Error querying information_schema:', schemaError);
                
                // Try with a raw SQL query using the postgres function
                const { data: rawData, error: rawError } = await supabase
                    .rpc('sql', { 
                        query: `
                            SELECT 
                                schemaname as schema_name,
                                tablename as table_name,
                                tableowner as table_owner
                            FROM pg_tables 
                            WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                            ORDER BY schemaname, tablename;
                        ` 
                    });
                    
                if (rawError) {
                    console.error('Error with raw SQL query:', rawError);
                    
                    // Final attempt - list common schemas
                    console.log('\n=== SUPABASE DATABASE TABLES ===\n');
                    console.log('Unable to query system tables directly with anon key.');
                    console.log('This is expected behavior for security reasons.\n');
                    
                    console.log('To list all tables, you would typically need to:');
                    console.log('1. Use the service role key (not anon key)');
                    console.log('2. Connect directly to the database with postgres credentials');
                    console.log('3. Use the Supabase dashboard');
                    console.log('4. Create a custom RPC function in the database\n');
                    
                    console.log('Common schemas in Supabase:');
                    console.log('- public: Your application tables');
                    console.log('- auth: Authentication system tables');
                    console.log('- storage: File storage tables');
                    console.log('- extensions: Database extensions');
                    console.log('- realtime: Real-time subscription tables\n');
                    
                    return;
                } else {
                    console.log('\n=== SUPABASE DATABASE TABLES ===\n');
                    rawData.forEach(table => {
                        console.log(`${table.schema_name}.${table.table_name} (owner: ${table.table_owner})`);
                    });
                }
            } else {
                console.log('\n=== SUPABASE DATABASE TABLES ===\n');
                schemaData.forEach(table => {
                    console.log(`${table.table_schema}.${table.table_name} (type: ${table.table_type})`);
                });
            }
        } else {
            console.log('\n=== SUPABASE DATABASE TABLES ===\n');
            tables.forEach(table => {
                console.log(`${table.schema}.${table.name}`);
            });
        }
        
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// Add a function to try alternative approaches
async function tryAlternativeApproaches() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    console.log('\n=== TRYING TO ACCESS SUPABASE TABLES ===\n');
    
    // Try to access some common table names
    const commonTables = ['users', 'profiles', 'posts', 'comments', 'products', 'orders', 'categories'];
    
    console.log('Checking for common table names:\n');
    
    for (const tableName of commonTables) {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(0); // Just check if table exists, don't fetch data
                
            if (!error) {
                console.log(`✅ Table '${tableName}' exists and is accessible`);
            }
        } catch (err) {
            // Table doesn't exist or isn't accessible
        }
    }
    
    console.log('\nNote: Only showing tables that are accessible with the anonymous key.');
    console.log('Some tables may exist but not be accessible due to Row Level Security (RLS) policies.\n');
}

// Run both approaches
listAllTables().then(() => {
    return tryAlternativeApproaches();
});