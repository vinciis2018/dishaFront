import { FullLayout } from '../../layouts/AppLayout';

export function DashboardPage() {
  // const { user } = useSelector((state: RootState) => state.auth);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

 

  return (
    <FullLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--background-alt)] rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
           Dashboard
          </h1>
          
 
        </div>
      </div>
    </FullLayout>
  );
}
