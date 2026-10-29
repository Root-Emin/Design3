import { createHashRouter, Navigate } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { BaselineApplicationPage } from "../pages/baseline/BaselineApplicationPage";
import { BaselineApplicationsPage } from "../pages/baseline/BaselineApplicationsPage";
import { JobPage } from "../pages/JobPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ApplicationDetailPage } from "../pages/v1/ApplicationDetailPage";
import { ApplicationsPage } from "../pages/v1/ApplicationsPage";
import { HomePage } from "../pages/v1/HomePage";
import { MessagePage } from "../pages/v1/MessagePage";
import { MessagesPage } from "../pages/v1/MessagesPage";
import { NotificationsPage } from "../pages/v1/NotificationsPage";
import { ProfilePage } from "../pages/v1/ProfilePage";
import { SavedJobsPage } from "../pages/v1/SavedJobsPage";
import { SearchPage } from "../pages/v1/SearchPage";
import { SuccessPage } from "../pages/v1/SuccessPage";
import { routePath } from "./paths";

/**
 * Hash tabanlı yönlendirme (prototip gibi sunucu ayarı gerektirmez): #/v1/basvurularim, #/baseline/basvuru/3 …
 * "baseline" mevcut ekranın sade kopyasıdır; tanımsız ekranlarında başvuru listesine düşer.
 */
export const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "v1",
        children: [
          { index: true, element: <ApplicationsPage /> },
          { path: "basvurularim", element: <ApplicationsPage /> },
          { path: "basvuru/:id", element: <ApplicationDetailPage /> },
          { path: "ilan/:id", element: <JobPage /> },
          { path: "basvur/:id", element: <JobPage openApply /> },
          { path: "basari/:id", element: <SuccessPage /> },
          { path: "ana", element: <HomePage /> },
          { path: "ara", element: <SearchPage /> },
          { path: "mesajlar", element: <MessagesPage /> },
          { path: "mesaj/:id", element: <MessagePage /> },
          { path: "profil", element: <ProfilePage /> },
          { path: "kayitli-ilanlar", element: <SavedJobsPage /> },
          { path: "bildirimler", element: <NotificationsPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      {
        path: "baseline",
        children: [
          { index: true, element: <BaselineApplicationsPage /> },
          { path: "basvuru/:id", element: <BaselineApplicationPage /> },
          { path: "ilan/:id", element: <JobPage /> },
          { path: "basvur/:id", element: <JobPage openApply /> },
          { path: "*", element: <BaselineApplicationsPage /> },
        ],
      },
      { path: "*", element: <Navigate to={routePath("v1", "basvurularim")} replace /> },
    ],
  },
]);
