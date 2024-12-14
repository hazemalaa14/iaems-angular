import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getDocs, query } from '@angular/fire/firestore';

interface FAQ {
  question: string;
  answer: string;
  isPending?: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  activeIndex: number | null = null;
  showUserForm = false;
  newUserQuestion = '';
  faqs: FAQ[] = [];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // Load FAQs from Firestore
    await this.loadFaqs();
  }

  async loadFaqs() {
    const faqsQuery = query(collection(this.firestore, 'faqs'));
    const querySnapshot = await getDocs(faqsQuery);
    this.faqs = querySnapshot.docs.map(doc => doc.data() as FAQ);
  }

  toggleFAQ(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  changeLanguage(lang: string) {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
  }

  toggleUserForm() {
    this.showUserForm = !this.showUserForm;
    if (!this.showUserForm) {
      this.newUserQuestion = '';
    }
  }

  async submitUserQuestion() {
    if (this.newUserQuestion.trim()) {
      const newFaq: FAQ = {
        question: this.newUserQuestion,
        answer: 'Pending answer from administrator',
        isPending: true
      };

      try {
        // Add to Firestore
        await addDoc(collection(this.firestore, 'faqs'), newFaq);
        
        // Update local state
        this.faqs.push(newFaq);
        this.newUserQuestion = '';
        this.showUserForm = false;
      } catch (error) {
        console.error('Error adding question:', error);
      }
    }
  }
}