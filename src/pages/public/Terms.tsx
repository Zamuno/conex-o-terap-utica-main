import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>

        <div className="prose prose-neutral max-w-none text-justify">
          <p className="text-muted-foreground mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground mb-4">
              Ao criar uma conta, acessar ou utilizar a plataforma <strong>149Psi</strong>, você concorda expressamente com estes Termos de Uso e com nossa Política de Privacidade.
              Estes termos constituem um contrato legal vinculativo entre você ("Usuário") e o 149Psi.
            </p>
            <p className="text-muted-foreground mb-4">
              Se você não concordar com qualquer disposição destes termos, você não deve utilizar nossos serviços.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground mb-4">
              O 149Psi é uma plataforma SaaS (Software as a Service) projetada para auxiliar psicólogos e terapeutas na gestão de seus atendimentos e para permitir que pacientes registrem seu bem-estar emocional.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Limitações:</strong> O serviço é fornecido "no estado em que se encontra". Embora nos esforcemos para manter a disponibilidade de 99,9%, podem ocorrer interrupções para manutenção ou por motivos de força maior.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cadastro e Conta</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Veracidade:</strong> Você concorda em fornecer informações verdadeiras, exatas e completas durante o cadastro.</li>
              <li><strong>Segurança:</strong> A guarda da senha de acesso é de sua exclusiva responsabilidade. Não compartilhe suas credenciais com terceiros.</li>
              <li><strong>Uso Pessoal:</strong> A conta é pessoal e intransferível.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Planos, Pagamentos e Assinaturas</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Cobrança:</strong> Os planos são pré-pagos e com renovação automática (mensal ou anual) via cartão de crédito processado pelo Stripe.</li>
              <li><strong>Inadimplência:</strong> Em caso de falha no pagamento, o acesso às funcionalidades premium poderá ser suspenso após o período de graça.</li>
              <li><strong>Reajustes:</strong> Os valores dos planos podem ser reajustados anualmente, com aviso prévio mínimo de 30 dias.</li>
              <li><strong>Tributos:</strong> Os valores informados já incluem os tributos aplicáveis conforme a legislação brasileira.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancelamento e Rescisão</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Pelo Usuário:</strong> Você pode cancelar sua assinatura a qualquer momento através do painel do usuário. O cancelamento interrompe a renovação automática, mantendo o acesso até o fim do período já pago.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Pelo 149Psi:</strong> Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, leis aplicáveis ou que permaneçam inativas por longos períodos em planos gratuitos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground mb-4">
              Todo o código-fonte, design, marca, logotipos e conteúdo estrutural do 149Psi são de propriedade exclusiva da plataforma.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Seu Conteúdo:</strong> Os dados (prontuários, diários) inseridos por você permanecem de sua propriedade intelectual. Você concede ao 149Psi uma licença para hospedar e processar esses dados exclusivamente para a prestação do serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Conduta do Usuário</h2>
            <p className="text-muted-foreground mb-4">É estritamente proibido:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Usar o serviço para fins ilegais ou não autorizados.</li>
              <li>Tentar violar a segurança do sistema ou realizar engenharia reversa.</li>
              <li>Inserir conteúdo ofensivo, discriminatório ou que viole direitos de terceiros.</li>
              <li>Compartilhar dados de pacientes sem o consentimento ético e legal adequado (para Terapeutas).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground mb-4">
              O 149Psi é uma ferramenta meio e <strong>NÃO substitui o julgamento profissional</strong> do terapeuta nem o tratamento médico.
            </p>
            <p className="text-muted-foreground mb-4">
              Não nos responsabilizamos por diagnósticos, decisões clínicas, danos indiretos, lucros cessantes ou perda de dados decorrentes de força maior ou falhas de terceiros. A responsabilidade total do 149Psi é limitada ao valor pago pelo usuário nos últimos 12 meses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disposições Gerais</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Atualizações:</strong> Estes termos podem ser alterados a qualquer momento. O uso continuado do serviço implica aceitação.</li>
              <li><strong>Lei e Foro:</strong> Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca da capital do estado de operação da empresa para dirimir quaisquer litígios.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para dúvidas legais ou sobre estes termos, entre em contato:
              <br />
              <strong>Email:</strong> suporte@149psi.com.br
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
