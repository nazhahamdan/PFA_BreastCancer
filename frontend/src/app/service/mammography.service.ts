import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface MammographyResult {
  id: number;
  imageUrl: string;
  resultat: 'CANCER' | 'NORMAL';
  confidence: number;
  dateAnalyse: string;
  details: string;
}
@Injectable({
  providedIn: 'root',
})
export class MammographyService {
  private api = 'http://localhost:8080/api/mammography';

  constructor(private http: HttpClient) {}

  analyser(patientId: number, image: File): Observable<MammographyResult> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<MammographyResult>(
      `${this.api}/patient/${patientId}/analyse`, formData
    );
  }

  getHistorique(patientId: number): Observable<MammographyResult[]> {
    return this.http.get<MammographyResult[]>(
      `${this.api}/patient/${patientId}/historique`
    );
  }

}
