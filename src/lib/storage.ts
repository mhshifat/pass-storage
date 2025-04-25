class Storage {
  private AUTH_TOKEN_NAME = "tid";
  private VAULT_IDENTIFIER = "vid";
  private VAULT_KEY = "vk";

  async getAuthToken() {
    return new Promise((res) => {
      const token = localStorage.getItem(this.AUTH_TOKEN_NAME);
      res(token);
    })
  }

  async setAuthToken(token: string) {
    return new Promise((res) => {
      localStorage.setItem(this.AUTH_TOKEN_NAME, token);
      res({});
    })
  }

  async removeAuthToken() {
    return new Promise((res) => {
      localStorage.removeItem(this.AUTH_TOKEN_NAME);
      res({});
    })
  }

  async getVaultIdentifier() {
    return new Promise((res) => {
      const token = localStorage.getItem(this.VAULT_IDENTIFIER);
      res(token);
    })
  }

  async setVaultIdentifier(token: string) {
    return new Promise((res) => {
      localStorage.setItem(this.VAULT_IDENTIFIER, token);
      res({});
    })
  }

  async removeVaultIdentifier() {
    return new Promise((res) => {
      localStorage.removeItem(this.VAULT_IDENTIFIER);
      res({});
    })
  }

  async getVaultKey() {
    return new Promise((res) => {
      const token = localStorage.getItem(this.VAULT_KEY);
      res(token);
    })
  }

  async setVaultKey(token: string) {
    return new Promise((res) => {
      localStorage.setItem(this.VAULT_KEY, token);
      res({});
    })
  }

  async removeVaultKey() {
    return new Promise((res) => {
      localStorage.removeItem(this.VAULT_KEY);
      res({});
    })
  }
}

export const storage = new Storage();
