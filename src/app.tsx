import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DebtsPage from '@/pages/DebtsPage/DebtsPage';
import PlanPage from '@/pages/PlanPage/PlanPage';
import BudgetPage from '@/pages/BudgetPage/BudgetPage';
import IncomePage from '@/pages/IncomePage/IncomePage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DebtsPage />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="income" element={<IncomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
