// 人脸识别API封装
import axios from 'axios';

const APP_ID = import.meta.env.VITE_APP_ID;

// 将图片转换为base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // 移除data:image/...;base64,前缀
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 从摄像头捕获图片并转换为base64
export async function captureImageFromCamera(): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        
        // 等待视频加载
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // 延迟一下让摄像头稳定
          setTimeout(() => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const base64 = canvas.toDataURL('image/jpeg', 0.8);
              const base64Data = base64.split(',')[1];
              
              // 停止摄像头
              stream.getTracks().forEach(track => track.stop());
              resolve(base64Data);
            } else {
              reject(new Error('无法获取canvas context'));
            }
          }, 1000);
        };
      })
      .catch(error => {
        console.error('获取摄像头失败:', error);
        reject(new Error('无法访问摄像头，请检查权限'));
      });
  });
}

// 注册人脸
export async function registerFace(
  userId: string,
  imageBase64: string,
  userInfo?: string
): Promise<{ success: boolean; message: string; faceToken?: string }> {
  try {
    const response = await axios.post(
      'https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-WJn9QGdMYKre/rest/2.0/face/v3/faceset/user/add',
      {
        image: imageBase64,
        image_type: 'BASE64',
        user_id: userId,
        user_info: userInfo || '',
        quality_control: 'NORMAL',
        liveness_control: 'LOW',
        action_type: 'REPLACE', // 替换已有的人脸
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
        message: '人脸注册成功',
        faceToken: response.data.data?.result?.face_token,
      };
    }

    return {
      success: false,
      message: response.data.msg || '人脸注册失败',
    };
  } catch (error: any) {
    console.error('注册人脸失败:', error);
    const errorMsg = error.response?.data?.msg || error.message || '注册失败，请稍后重试';
    return {
      success: false,
      message: errorMsg,
    };
  }
}

// 人脸搜索（1:N识别）
export async function searchFace(
  imageBase64: string
): Promise<{ success: boolean; message: string; userId?: string; score?: number }> {
  try {
    const response = await axios.post(
      'https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-3w5Yr4gW9XRo/rest/2.0/face/v3/search',
      {
        image: imageBase64,
        image_type: 'BASE64',
        quality_control: 'NORMAL',
        liveness_control: 'LOW',
        max_user_num: 1,
        match_threshold: 80, // 推荐阈值80分
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );

    if (response.data.status === 0) {
      const userList = response.data.data?.result?.user_list;
      if (userList && userList.length > 0) {
        const topMatch = userList[0];
        return {
          success: true,
          message: '人脸识别成功',
          userId: topMatch.user_id,
          score: topMatch.score,
        };
      }
      
      return {
        success: false,
        message: '未找到匹配的人脸',
      };
    }

    return {
      success: false,
      message: response.data.msg || '人脸识别失败',
    };
  } catch (error: any) {
    console.error('人脸搜索失败:', error);
    const errorMsg = error.response?.data?.msg || error.message || '识别失败，请稍后重试';
    return {
      success: false,
      message: errorMsg,
    };
  }
}

// 人脸对比（1:1对比）
export async function compareFaces(
  image1Base64: string,
  image2Base64: string
): Promise<{ success: boolean; message: string; score?: number }> {
  try {
    const response = await axios.post(
      'https://api-integrations.appmiaoda.com/app-883oyd7kz475/api-oZwL1Og1aNen/rest/2.0/face/v3/match',
      [
        {
          image: image1Base64,
          image_type: 'BASE64',
          face_type: 'LIVE',
          quality_control: 'LOW',
          liveness_control: 'HIGH',
        },
        {
          image: image2Base64,
          image_type: 'BASE64',
          face_type: 'LIVE',
          quality_control: 'LOW',
          liveness_control: 'HIGH',
        },
      ],
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
      }
    );

    if (response.data.status === 0) {
      const score = response.data.data?.result?.score;
      return {
        success: true,
        message: '对比成功',
        score,
      };
    }

    return {
      success: false,
      message: response.data.msg || '对比失败',
    };
  } catch (error: any) {
    console.error('人脸对比失败:', error);
    const errorMsg = error.response?.data?.msg || error.message || '对比失败，请稍后重试';
    return {
      success: false,
      message: errorMsg,
    };
  }
}
