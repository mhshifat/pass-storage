class Storage {
  private AUTH_TOKEN_NAME = "tid";

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
}

export const storage = new Storage();
