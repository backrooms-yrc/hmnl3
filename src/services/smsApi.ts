// 短信验证码API封装
import axios from 'axios';

const APP_ID = import.meta.env.VITE_APP_ID;

// 生成唯一的session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// 发送短信验证码
export async function sendSmsCode(phone: string, sessionId: string): Promise<{ success: boolean; message: string; sessionId?: string }> {
  try {
    const response = await axios.post(
      'https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-lqWwLNGvYXJy/innerapi/v1/code/send_message',
      {
        phone,
        sessionId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );

    if (response.data.status === 0) {
      return {
        success: true,
        message: '验证码发送成功',
        sessionId: response.data.data?.sessionId || sessionId,
      };
    }

    return {
      success: false,
      message: response.data.msg || '发送失败',
    };
  } catch (error) {
    console.error('发送短信验证码失败:', error);
    return {
      success: false,
      message: '发送失败，请稍后重试',
    };
  }
}

// 验证短信验证码
export async function verifySmsCode(
  phone: string,
  code: string,
  sessionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axios.post(
      'https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-A2Ve942jYyrK/innerapi/v1/code/verify_message_code',
      {
        phone,
        phoneCode: code,
        sessionId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );

    if (response.data.status === 0) {
      return {
        success: true,
        message: '验证成功',
      };
    }

    return {
      success: false,
      message: response.data.msg || '验证失败',
    };
  } catch (error) {
    console.error('验证短信验证码失败:', error);
    return {
      success: false,
      message: '验证失败，请稍后重试',
    };
  }
}
