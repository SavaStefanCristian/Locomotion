import { Pipe, PipeTransform } from '@angular/core';
import { FlagCountry } from '../data/flag-countries';

@Pipe({
  name: 'countryFilter',
  standalone: true
})
export class CountryFilterPipe implements PipeTransform {

  transform(countries: FlagCountry[], query: string, solvedIds: Set<string>): FlagCountry[] {
    if (!countries) return [];

    const normalizedQuery = this.normalize(query);

    return countries.filter(c => {
      if (solvedIds.has(c.id)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return this.normalize(c.name).includes(normalizedQuery);
    });
  }

  // Helper: "Türkiye" -> "turkiye"
  private normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
