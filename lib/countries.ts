export interface Country {
  code: string;
  name: string;
  careerjet?: string; // locale_code
  adzuna?: boolean;
  jobicy?: string; // slug geo
}

export const COUNTRIES: Country[] = [
  { code: 'pt', name: 'Portugal', careerjet: 'pt_PT', jobicy: 'portugal' },
  { code: 'es', name: 'Espanha', careerjet: 'es_ES', adzuna: true, jobicy: 'spain' },
  { code: 'fr', name: 'França', careerjet: 'fr_FR', adzuna: true, jobicy: 'france' },
  { code: 'de', name: 'Alemanha', careerjet: 'de_DE', adzuna: true, jobicy: 'germany' },
  { code: 'gb', name: 'Reino Unido', careerjet: 'en_GB', adzuna: true, jobicy: 'uk' },
  { code: 'ie', name: 'Irlanda', careerjet: 'en_IE', jobicy: 'ireland' },
  { code: 'us', name: 'Estados Unidos', careerjet: 'en_US', adzuna: true, jobicy: 'usa' },
  { code: 'ca', name: 'Canadá', careerjet: 'en_CA', adzuna: true, jobicy: 'canada' },
  { code: 'br', name: 'Brasil', careerjet: 'pt_BR', adzuna: true, jobicy: 'brazil' },
  { code: 'it', name: 'Itália', careerjet: 'it_IT', adzuna: true, jobicy: 'italy' },
  { code: 'nl', name: 'Países Baixos', careerjet: 'nl_NL', adzuna: true, jobicy: 'netherlands' },
  { code: 'be', name: 'Bélgica', careerjet: 'fr_BE', adzuna: true, jobicy: 'belgium' },
  { code: 'ch', name: 'Suíça', careerjet: 'de_CH', adzuna: true, jobicy: 'switzerland' },
  { code: 'at', name: 'Áustria', careerjet: 'de_AT', adzuna: true, jobicy: 'austria' },
  { code: 'pl', name: 'Polónia', careerjet: 'pl_PL', adzuna: true, jobicy: 'poland' },
  { code: 'au', name: 'Austrália', careerjet: 'en_AU', adzuna: true, jobicy: 'australia' },
];

export const getCountry = (code: string) => COUNTRIES.find((c) => c.code === code);
