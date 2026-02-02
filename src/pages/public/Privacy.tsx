import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>

        <div className="prose prose-neutral max-w-none text-justify">
          <p className="text-muted-foreground mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p className="text-muted-foreground mb-4">
              Bem-vindo ao <strong>149Psi</strong>. Sua privacidade é fundamental para nós.
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais,
              em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)</strong>.
            </p>
            <p className="text-muted-foreground mb-4">
              Ao utilizar nossos serviços, você reconhece que leu e compreendeu os termos aqui descritos e concorda com o tratamento de seus dados conforme esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Definições (LGPD)</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Dados Pessoais:</strong> Qualquer informação relacionada a pessoa natural identificada ou identificável (ex: nome, e-mail, CPF).</li>
              <li><strong>Dados Sensíveis:</strong> Dados sobre origem racial, convicção religiosa, opinião política, saúde ou vida sexual, dado genético ou biométrico.</li>
              <li><strong>Titular:</strong> Você, pessoa física a quem os dados se referem.</li>
              <li><strong>Controlador:</strong> O 149Psi, responsável pelas decisões sobre o tratamento de dados.</li>
              <li><strong>Operador:</strong> Parte que realiza o tratamento de dados em nome do controlador (ex: provedores de nuvem, gateways de pagamento).</li>
              <li><strong>Tratamento:</strong> Toda operação realizada com dados pessoais, como coleta, classificação, utilização, acesso, arquivamento e eliminação.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Dados que Coletamos</h2>
            <p className="text-muted-foreground mb-4">Coletamos apenas os dados necessários para a prestação dos nossos serviços:</p>

            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.1. Dados Cadastrais</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Senha (criptografada)</li>
              <li>Telefone (opcional)</li>
              <li>Dados profissionais (para Terapeutas: CRP, Especialidade)</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.2. Dados de Uso (Saúde e Bem-Estar)</h3>
            <p className="text-muted-foreground mb-2">Inseridos proativamente por você:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Registros de diário emocional e check-ins de humor.</li>
              <li>Respostas a questionários psicológicos.</li>
              <li>Notas de sessão e evoluções (inseridos por Terapeutas).</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.3. Dados Financeiros</h3>
            <p className="text-muted-foreground mb-4">
              Processados e armazenados pelo nosso parceiro <strong>Stripe</strong>. O 149Psi não armazena números completos de cartão de crédito, tendo acesso apenas a tokens de pagamento e status da assinatura.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.4. Dados Técnicos</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Logs de acesso e auditoria de segurança</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Finalidade do Tratamento</h2>
            <p className="text-muted-foreground mb-4">Tratamos seus dados para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Prestação dos Serviços:</strong> Permitir o uso da plataforma, gestão de pacientes e registros terapêuticos.</li>
              <li><strong>Segurança:</strong> Identificação e autenticação de usuários, prevenção de fraudes.</li>
              <li><strong>Comunicação:</strong> Envio de avisos importantes, atualizações do sistema e suporte.</li>
              <li><strong>Cumprimento Legal:</strong> Atendimento a obrigações legais (Marco Civil da Internet, LGPD) e regulatórias.</li>
              <li><strong>Melhoria do Produto:</strong> Análise anonimizada de uso para aprimorar funcionalidades.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Bases Legais</h2>
            <p className="text-muted-foreground mb-4">O tratamento de dados é realizado com amparo nas seguintes bases legais (Art. 7º LGPD):</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Execução de Contrato:</strong> Para prover os serviços contratados (Termos de Uso).</li>
              <li><strong>Consentimento:</strong> Para coleta de dados sensíveis de saúde e envio de marketing (quando aplicável).</li>
              <li><strong>Obrigação Legal:</strong> Guarda de logs de acesso (Marco Civil) e dados fiscais.</li>
              <li><strong>Legítimo Interesse:</strong> Segurança da plataforma e prevenção a fraudes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground mb-4">
              <strong>O 149Psi não vende seus dados pessoais.</strong> O compartilhamento ocorre apenas nas seguintes hipóteses:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Operadores de Tecnologia:</strong> Provedores de nuvem (Supabase/AWS) e infraestrutura para execução do serviço.</li>
              <li><strong>Processamento de Pagamentos:</strong> Stripe, para gestão de assinaturas.</li>
              <li><strong>Terapeuta/Paciente:</strong> Compartilhamento intencional de dados dentro da plataforma conforme a funcionalidade de vinculação.</li>
              <li><strong>Requisição Judicial:</strong> Mediante ordem judicial ou requisição de autoridade competente.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Direitos do Titular</h2>
            <p className="text-muted-foreground mb-4">Conforme a LGPD, você tem os seguintes direitos:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e solicitar uma cópia deles.</li>
              <li><strong>Correção:</strong> Solicitar a retificação de dados incorretos, inexatos ou desatualizados.</li>
              <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados para outro fornecedor (disponível no Painel de Privacidade).</li>
              <li><strong>Eliminação:</strong> Solicitar a exclusão de dados pessoais tratados com consentimento.</li>
              <li><strong>Revogação do Consentimento:</strong> Retirar a autorização para tratamentos baseados exclusivamente no consentimento.</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Você pode exercer esses direitos diretamente no seu <strong>Dashboard de Privacidade</strong> ou entrando em contato conosco.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Retenção e Exclusão</h2>
            <p className="text-muted-foreground mb-4">
              Armazenamos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprir nossas obrigações legais.
            </p>
            <p className="text-muted-foreground mb-4">
              Ao solicitar a exclusão da conta, seus dados serão removidos permanentemente de nossos sistemas ativos, ressalvados os prazos legais de guarda (ex: registros de acesso por 6 meses conforme Marco Civil, dados fiscais por 5 anos).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Segurança da Informação</h2>
            <p className="text-muted-foreground mb-4">Adotamos rígidas medidas de segurança, incluindo:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Criptografia de ponta a ponta em trânsito (SSL/TLS) e criptografia em repouso.</li>
              <li>Controles de acesso restritos e autenticação robusta.</li>
              <li>Monitoramento contínuo e logs de auditoria de acessos.</li>
              <li>Políticas internas de segurança e governança de dados.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies e Tecnologias</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos cookies essenciais para autenticação e segurança. Cookies analíticos podem ser usados para entender como a plataforma é utilizada, sempre de forma agregada. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Alterações nesta Política</h2>
            <p className="text-muted-foreground mb-4">
              Esta política pode ser atualizada periodicamente. Versões significativas serão comunicadas por e-mail ou aviso na plataforma. A continuação do uso do serviço após as alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para dúvidas, solicitações ou exercício de direitos, entre em contato com nosso Encarregado de Dados (DPO):
            </p>
            <p className="text-muted-foreground mb-4 font-medium">
              E-mail: privacidade@149psi.com.br<br />
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
