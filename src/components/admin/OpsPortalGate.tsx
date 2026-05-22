import { ReactNode, useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const GATE_KEY = 'ops_gate_passed_v1';
const GATE_PASSWORD = 'JESUS';

interface Props {
  children: ReactNode;
}

const OpsPortalGate = ({ children }: Props) => {
  const [passed, setPassed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setPassed(sessionStorage.getItem(GATE_KEY) === '1');
    setChecked(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().toUpperCase() === GATE_PASSWORD) {
      sessionStorage.setItem(GATE_KEY, '1');
      setPassed(true);
    } else {
      setError('Incorrect passphrase.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (passed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-pulse' : ''}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-light tracking-[0.2em] text-foreground uppercase">
            Restricted Area
          </h1>
          <p className="text-xs text-muted-foreground mt-2 tracking-wider">
            Enter passphrase to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gate-pw" className="text-xs uppercase tracking-wider">
              Passphrase
            </Label>
            <Input
              id="gate-pw"
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              className="h-11 bg-secondary border-border"
              autoFocus
              autoComplete="off"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-11 text-xs uppercase tracking-[0.15em]">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OpsPortalGate;
