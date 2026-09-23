import searchData from './searchData.json';

export class JsonDataReader {
  private static instance: JsonDataReader;

  private constructor() {}

  static getInstance(): JsonDataReader {
    return this.instance ??= new JsonDataReader();
  }

  getSearchTerm(key: keyof typeof searchData.SearchTerms): string {
    return searchData.SearchTerms[key];
  }

  getCheckoutCustomer() {
    return searchData.CheckoutCustomer;
  }

  getAuthenticationData() {
    return searchData.Authentication;
  }
}
