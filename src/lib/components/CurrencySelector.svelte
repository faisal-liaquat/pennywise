<script>
  import { userCurrency, saveUserCurrency } from '$lib/stores/budget.js'
  import { toast } from '$lib/stores/toast.js'

  const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'دج' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'din' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: '£' },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'лв' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'lei' },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
    { code: 'BAM', name: 'Bosnian Mark', symbol: 'KM' },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
    { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
    { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
    { code: 'VEF', name: 'Venezuelan Bolívar', symbol: 'Bs.F' },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
    { code: 'CUP', name: 'Cuban Peso', symbol: '₱' },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
    { code: 'TTD', name: 'Trinidad Dollar', symbol: 'TT$' },
    { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$' },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$' },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
    { code: 'BWP', name: 'Botswanan Pula', symbol: 'P' },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'Fr' },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fr' },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'Fr' },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'Fr' },
    { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le' },
    { code: 'LRD', name: 'Liberian Dollar', symbol: '$' },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
    { code: 'SDG', name: 'Sudanese Pound', symbol: '£' },
    { code: 'SSP', name: 'South Sudanese Pound', symbol: '£' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD' },
    { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc' },
    { code: 'STN', name: 'São Tomé Dobra', symbol: 'Db' },
    { code: 'XOF', name: 'West African CFA', symbol: 'Fr' },
    { code: 'XAF', name: 'Central African CFA', symbol: 'Fr' },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
    { code: 'XPF', name: 'CFP Franc', symbol: 'Fr' },
    { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
    { code: 'WST', name: 'Samoan Tala', symbol: 'WS$' },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
    { code: 'KID', name: 'Kiribati Dollar', symbol: '$' },
    { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
    { code: 'LAK', name: 'Laotian Kip', symbol: '₭' },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
    { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu' },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'P' },
    { code: 'KPW', name: 'North Korean Won', symbol: '₩' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'Fr' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
  ]

  let searchQuery = $state('')
  let isOpen = $state(false)
  let saving = $state(false)

  const filteredCurrencies = $derived(
    searchQuery.trim() === ''
      ? CURRENCIES
      : CURRENCIES.filter(
          (c) =>
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.symbol.includes(searchQuery)
        )
  )

  const selectedCurrency = $derived(
    CURRENCIES.find((c) => c.code === $userCurrency) || CURRENCIES[0]
  )

  async function selectCurrency(code) {
    if (code === $userCurrency) {
      isOpen = false
      return
    }
    saving = true
    try {
      await saveUserCurrency(code)
      toast.success(`Currency changed to ${code}`)
    } catch (err) {
      toast.error('Failed to save currency')
    } finally {
      saving = false
      isOpen = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') isOpen = false
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="rounded-2xl p-5"
  style="background: var(--color-surface); border: 1px solid var(--color-border);"
>
  <h2 class="text-sm font-semibold mb-1" style="color: var(--color-text);">Currency</h2>
  <p class="text-xs mb-4" style="color: var(--color-text-subtle);">
    Choose your preferred display currency
  </p>

  <!-- Dropdown Trigger -->
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    class="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
    style="
      background: var(--color-surface-2);
      border-color: {isOpen ? '#7c3aed' : 'var(--color-border)'};
      color: var(--color-text);
    "
  >
    <div class="flex items-center gap-3">
      <span
        class="w-10 text-center text-sm font-bold rounded-lg py-1"
        style="background: rgba(124,58,237,0.12); color: #7c3aed;"
      >
        {selectedCurrency.code}
      </span>
      <div class="text-left">
        <p class="text-sm font-medium" style="color: var(--color-text);">{selectedCurrency.name}</p>
        <p class="text-xs" style="color: var(--color-text-muted);">{selectedCurrency.symbol}</p>
      </div>
    </div>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="transition-transform duration-200"
      style="color: var(--color-text-muted); transform: rotate({isOpen ? '180deg' : '0deg'});"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  <!-- Dropdown Panel -->
  {#if isOpen}
    <div
      class="mt-2 rounded-xl border overflow-hidden"
      style="background: var(--color-surface); border-color: var(--color-border); box-shadow: 0 8px 30px rgba(0,0,0,0.15);"
    >
      <!-- Search -->
      <div class="p-3 border-b" style="border-color: var(--color-border);">
        <input
          type="text"
          placeholder="Search currency..."
          bind:value={searchQuery}
          class="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style="
            background: var(--color-surface-2);
            border: 1px solid var(--color-border);
            color: var(--color-text);
          "
        />
      </div>

      <!-- Currency List -->
      <div class="overflow-y-auto" style="max-height: 260px;">
        {#if filteredCurrencies.length === 0}
          <p class="text-center py-6 text-sm" style="color: var(--color-text-muted);">
            No currencies found
          </p>
        {:else}
          {#each filteredCurrencies as currency}
            <button
              type="button"
              class="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style="
                background: {$userCurrency === currency.code
                ? 'rgba(124,58,237,0.08)'
                : 'transparent'};
                color: var(--color-text);
              "
              onmouseenter={(e) => {
                if ($userCurrency !== currency.code)
                  e.currentTarget.style.background = 'var(--color-surface-2)'
              }}
              onmouseleave={(e) => {
                if ($userCurrency !== currency.code)
                  e.currentTarget.style.background = 'transparent'
              }}
              onclick={() => selectCurrency(currency.code)}
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-10 text-center text-sm font-bold rounded-lg py-1"
                  style="background: rgba(124,58,237,0.12); color: #7c3aed;"
                >
                  {currency.code}
                </span>
                <span class="text-sm" style="color: var(--color-text);">{currency.name}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm" style="color: var(--color-text-muted);"
                  >{currency.symbol}</span
                >
                {#if $userCurrency === currency.code}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}

  <p class="text-xs mt-3" style="color: var(--color-text-muted);">
    {CURRENCIES.length} currencies available · Changes apply immediately across the app
  </p>
</div>
