// Database Connection Test
// Run this to verify Supabase connection and schema

import { supabase } from './supabaseClient'

/**
 * Test database connection and schema
 * @returns {Promise<Object>} Test results
 */
export async function testDatabaseConnection() {
  const results = {
    connection: false,
    tables: {},
    categories: 0,
    errors: [],
  }

  try {
    // Test 1: Check connection
    console.log('🔍 Testing Supabase connection...')
    const { error: pingError } = await supabase.from('categories').select('count').limit(1)

    if (pingError) {
      results.errors.push(`Connection failed: ${pingError.message}`)
      return results
    }

    results.connection = true
    console.log('✅ Connection successful')

    // Test 2: Check profiles table
    console.log('🔍 Testing profiles table...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profileError) {
      results.errors.push(`Profiles table: ${profileError.message}`)
    } else {
      results.tables.profiles = true
      console.log('✅ Profiles table accessible')
    }

    // Test 3: Check budget_periods table
    console.log('🔍 Testing budget_periods table...')
    const { data: budgetData, error: budgetError } = await supabase
      .from('budget_periods')
      .select('id')
      .limit(1)

    if (budgetError) {
      results.errors.push(`Budget periods table: ${budgetError.message}`)
    } else {
      results.tables.budget_periods = true
      console.log('✅ Budget periods table accessible')
    }

    // Test 4: Check categories table and count system categories
    console.log('🔍 Testing categories table...')
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_system', true)

    if (categoryError) {
      results.errors.push(`Categories table: ${categoryError.message}`)
    } else {
      results.tables.categories = true
      results.categories = categoryData?.length || 0
      console.log(`✅ Categories table accessible (${results.categories} system categories)`)
    }

    // Test 5: Check transactions table
    console.log('🔍 Testing transactions table...')
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1)

    if (transactionError) {
      results.errors.push(`Transactions table: ${transactionError.message}`)
    } else {
      results.tables.transactions = true
      console.log('✅ Transactions table accessible')
    }

    // Summary
    console.log('\n📊 Test Summary:')
    console.log(`Connection: ${results.connection ? '✅' : '❌'}`)
    console.log(`Tables accessible: ${Object.keys(results.tables).length}/4`)
    console.log(`System categories: ${results.categories}/21 expected`)

    if (results.errors.length > 0) {
      console.log('\n❌ Errors found:')
      results.errors.forEach((err) => console.log(`  - ${err}`))
    } else {
      console.log('\n✅ All tests passed!')
    }
  } catch (error) {
    results.errors.push(`Unexpected error: ${error.message}`)
    console.error('❌ Test failed:', error)
  }

  return results
}

/**
 * Get system categories grouped by type
 * @returns {Promise<Object>} Categories grouped by income/expense
 */
export async function getSystemCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_system', true)
      .order('type')
      .order('name')

    if (error) throw error

    // Group by type
    const grouped = {
      income: data.filter((cat) => cat.type === 'income'),
      expense: data.filter((cat) => cat.type === 'expense'),
    }

    console.log('📂 System Categories:')
    console.log(`  Income: ${grouped.income.length}`)
    console.log(`  Expense: ${grouped.expense.length}`)

    return grouped
  } catch (error) {
    console.error('Error fetching system categories:', error)
    return { income: [], expense: [] }
  }
}
