class ApiResponse {
  public statusCode: number;
  public message: string;
  public success: boolean;
  public data: object;

  constructor(statusCode: number, message: string = "success", data: object) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
  }
}

export default ApiResponse;
