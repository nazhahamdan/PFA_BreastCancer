import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticService } from '../../service/diagnostic.service';

interface Question {
  id: string;
  texte: string;
  score: number;
  reponse: boolean;
}

interface Etape {
  titre: string;
  icone: string;
  description: string;
  questions: Question[];
}

@Component({
  selector: 'app-diagnostic-priliminaire',
  imports: [CommonModule,FormsModule],
  templateUrl: './diagnostic-priliminaire.html',
  styleUrl: './diagnostic-priliminaire.css',
})
export class DiagnosticPriliminaire {
  patientId = 1;
  etapeActuelle = 0;
  termine = false;
  scoreTotal = 0;
  enSauvegarde = false;

  etapes: Etape[] = [
    {
      titre: 'Signes généraux',
      icone: '🩺',
      description: 'Ces symptômes généraux peuvent être des signes d\'alerte non spécifiques.',
      questions: [
        { id: 'q1',  texte: 'Fatigue inhabituelle, persistante ou progressive',         score: 5,  reponse: false },
        { id: 'q2',  texte: 'Amaigrissement involontaire et inexpliqué',                score: 8,  reponse: false },
        { id: 'q3',  texte: 'Perte d\'appétit inexpliquée',                             score: 5,  reponse: false },
        { id: 'q4',  texte: 'Fièvre prolongée sans cause infectieuse identifiée',       score: 6,  reponse: false },
        { id: 'q5',  texte: 'Sueurs nocturnes importantes',                             score: 6,  reponse: false },
        { id: 'q6',  texte: 'Douleur persistante, progressive ou inexpliquée',          score: 8,  reponse: false },
        { id: 'q7',  texte: 'Nouvelle masse ou grosseur palpable (autre que le sein)',  score: 8,  reponse: false },
        { id: 'q8',  texte: 'Saignement vaginal anormal ou post-ménopausique',          score: 10, reponse: false },
      ]
    },
    {
      titre: 'Masse & forme du sein',
      icone: '🔍',
      description: 'Les modifications du sein sont les signes les plus importants à surveiller.',
      questions: [
        { id: 'q9',  texte: 'Nouvelle masse mammaire palpable',                         score: 15, reponse: false },
        { id: 'q10', texte: 'Zone d\'induration ou d\'épaississement localisé',          score: 12, reponse: false },
        { id: 'q11', texte: 'Masse dure, irrégulière ou peu mobile',                    score: 12, reponse: false },
        { id: 'q12', texte: 'Asymétrie mammaire nouvellement apparue',                  score: 8,  reponse: false },
        { id: 'q13', texte: 'Augmentation du volume d\'un seul sein',                   score: 8,  reponse: false },
        { id: 'q14', texte: 'Adénopathie axillaire nouvelle (ganglion sous le bras)',   score: 12, reponse: false },
        { id: 'q15', texte: 'Rétraction visible lors de l\'élévation des bras',         score: 10, reponse: false },
      ]
    },
    {
      titre: 'Peau & mamelon',
      icone: '👁️',
      description: 'Les modifications cutanées et du mamelon sont des signaux d\'alerte importants.',
      questions: [
        { id: 'q16', texte: 'Rétraction ou capitonnage cutané',                         score: 10, reponse: false },
        { id: 'q17', texte: 'Aspect en peau d\'orange',                                 score: 12, reponse: false },
        { id: 'q18', texte: 'Rougeur, chaleur ou œdème persistant du sein',             score: 10, reponse: false },
        { id: 'q19', texte: 'Ulcération ou plaie ne cicatrisant pas',                   score: 10, reponse: false },
        { id: 'q20', texte: 'Rétraction ou inversion récente du mamelon',               score: 10, reponse: false },
        { id: 'q21', texte: 'Écoulement mamelonnaire anormal (séreux ou sanglant)',     score: 12, reponse: false },
        { id: 'q22', texte: 'Lésion eczématiforme persistante du mamelon',              score: 8,  reponse: false },
      ]
    },
    {
      titre: 'Signes d\'extension',
      icone: '⚠️',
      description: 'Ces symptômes peuvent indiquer une extension. Consultez immédiatement si présents.',
      questions: [
        { id: 'q23', texte: 'Douleurs osseuses persistantes inexpliquées',              score: 8,  reponse: false },
        { id: 'q24', texte: 'Toux ou essoufflement inexpliqué',                         score: 6,  reponse: false },
        { id: 'q25', texte: 'Céphalées inhabituelles ou progressives',                  score: 6,  reponse: false },
        { id: 'q26', texte: 'Jaunisse (jaunissement de la peau ou des yeux)',           score: 8,  reponse: false },
      ]
    }
  ];

  // ── Navigation ──────────────────────────────────────────
  get progression(): number {
    return Math.round(((this.etapeActuelle) / this.etapes.length) * 100);
  }

  get etape(): Etape {
    return this.etapes[this.etapeActuelle];
  }

  etapeSuivante() {
    if (this.etapeActuelle < this.etapes.length - 1) {
      this.etapeActuelle++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.calculerScore();
    }
  }

  etapePrecedente() {
    if (this.etapeActuelle > 0) {
      this.etapeActuelle--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Score ───────────────────────────────────────────────
  calculerScore() {
    this.scoreTotal = this.etapes
      .flatMap(e => e.questions)
      .filter(q => q.reponse)
      .reduce((sum, q) => sum + q.score, 0);

    // Plafonner à 100
    this.scoreTotal = Math.min(this.scoreTotal, 100);
    this.termine = true;

    // Sauvegarder en base
    this.sauvegarderDiagnostic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get scoreClass(): string {
    if (this.scoreTotal >= 50) return 'score-danger';
    if (this.scoreTotal >= 25) return 'score-warning';
    return 'score-ok';
  }

  get scoreMessage(): string {
    if (this.scoreTotal >= 50) return 'Consultation médicale urgente recommandée';
    if (this.scoreTotal >= 25) return 'Surveillance recommandée — consultez votre médecin prochainement';
    return 'Pas de signe d\'alerte majeur détecté';
  }

  get scoreIcone(): string {
    if (this.scoreTotal >= 50) return '🔴';
    if (this.scoreTotal >= 25) return '⚠️';
    return '✅';
  }

  get symptoesCoches(): Question[] {
    return this.etapes.flatMap(e => e.questions).filter(q => q.reponse);
  }

  // ── Sauvegarde ──────────────────────────────────────────
  sauvegarderDiagnostic() {
    this.enSauvegarde = true;
    const status = this.scoreTotal >= 50 ? 'CANCER'
                : this.scoreTotal >= 25 ? 'SUSPECT'
                : 'BON';

    const symptomesTexte = this.symptoesCoches.map(q => q.texte).join(', ');

    this.diagnosticService.ajouterDiagnostic(this.patientId, {
      type          : 'SYMPTOM_DIAGNOSTIC' as any,
      status        : status as any,
      date          : new Date().toISOString().split('T')[0] as any,
      symptomes     : symptomesTexte || 'Aucun symptôme signalé',
      recommandation: this.scoreMessage,
      details       : `Score diagnostic préliminaire : ${this.scoreTotal}/100`,
      scoreConfidence: this.scoreTotal,
    }).subscribe({
      next : () => { this.enSauvegarde = false; },
      error: () => { this.enSauvegarde = false; }
    });
  }

  constructor(
    private diagnosticService: DiagnosticService,
    private router: Router
  ) {}

  allerDashboard() {
    this.router.navigate(['/dashboard']);
  }

  recommencer() {
    this.etapes.forEach(e => e.questions.forEach(q => q.reponse = false));
    this.etapeActuelle = 0;
    this.termine       = false;
    this.scoreTotal    = 0;
  }

}
