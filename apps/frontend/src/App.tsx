import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { router } from './router';
import { RouterProvider } from 'react-router';

function App() {

  return (
    <StyleProvider layer>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#3D9A50",
            // colorSuccess: "",
            // colorWarning: "",
            // colorError: "",
            // colorInfo: "",
            colorBgBase: "#F5FAF6",
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </StyleProvider>
  );
}

export default App;
