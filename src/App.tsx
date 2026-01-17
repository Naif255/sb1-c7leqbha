import { Route, Switch } from 'wouter';
import Home from './pages/Home';
import Library from './pages/Library';
import HowItWorks from './pages/HowItWorks';
import Recitation from './pages/Recitation';

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={Library} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/recitation/:id" component={Recitation} />
      <Route>
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
          <p className="text-xl">404 - Page Not Found</p>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
